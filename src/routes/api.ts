import { Hono } from 'hono';
import type { Env, User } from '../index';

const app = new Hono<Env>();

// Middleware to check auth
app.use('*', async (c, next) => {
  const sessionId = c.req.header('cookie')?.match(/session=([^;]+)/)?.[1];
  
  if (!sessionId) {
    return c.json({ error: 'Non authentifié' }, 401);
  }
  
  const user = await c.env.DB.prepare(
    'SELECT u.id, u.email, u.subscription_status, u.trial_end_date FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime("now")'
  ).bind(sessionId).first<User>();
  
  if (!user) {
    return c.json({ error: 'Session invalide' }, 401);
  }
  
  // Check subscription
  const hasAccess = user.subscription_status === 'active' || 
                    user.subscription_status === 'trialing' ||
                    (user.trial_end_date && new Date(user.trial_end_date) > new Date());
  
  if (!hasAccess) {
    return c.json({ error: 'Abonnement requis' }, 403);
  }
  
  c.set('user', user);
  await next();
});

// Generate business plan
app.post('/generate', async (c) => {
  const user = c.get('user');
  const { businessName, industry, description, goals, targetMarket } = await c.req.json();
  
  if (!businessName || !industry || !description) {
    return c.json({ error: 'Champs requis manquants' }, 400);
  }
  
  // Call AI API (Kimi/OpenAI)
  const planContent = await generateBusinessPlan(c.env.KIMI_API_KEY, {
    businessName, industry, description, goals, targetMarket
  });
  
  // Save to database
  const result = await c.env.DB.prepare(
    'INSERT INTO business_plans (user_id, title, content, business_name, industry) VALUES (?, ?, ?, ?, ?) RETURNING id'
  ).bind(user.id, `Plan d'affaires - ${businessName}`, JSON.stringify(planContent), businessName, industry).first<{ id: number }>();
  
  return c.json({ 
    success: true, 
    planId: result?.id,
    content: planContent 
  });
});

// Get user's business plans
app.get('/plans', async (c) => {
  const user = c.get('user');
  
  const plans = await c.env.DB.prepare(
    'SELECT id, title, business_name, industry, created_at FROM business_plans WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all();
  
  return c.json({ plans: plans.results });
});

// Get single plan
app.get('/plans/:id', async (c) => {
  const user = c.get('user');
  const planId = c.req.param('id');
  
  const plan = await c.env.DB.prepare(
    'SELECT * FROM business_plans WHERE id = ? AND user_id = ?'
  ).bind(planId, user.id).first();
  
  if (!plan) {
    return c.json({ error: 'Plan non trouvé' }, 404);
  }
  
  return c.json({ 
    plan: {
      ...plan,
      content: JSON.parse(plan.content as string)
    }
  });
});

// Update plan
app.put('/plans/:id', async (c) => {
  const user = c.get('user');
  const planId = c.req.param('id');
  const { content } = await c.req.json();
  
  const plan = await c.env.DB.prepare(
    'SELECT id FROM business_plans WHERE id = ? AND user_id = ?'
  ).bind(planId, user.id).first();
  
  if (!plan) {
    return c.json({ error: 'Plan non trouvé' }, 404);
  }
  
  await c.env.DB.prepare(
    'UPDATE business_plans SET content = ?, updated_at = datetime("now") WHERE id = ?'
  ).bind(JSON.stringify(content), planId).run();
  
  return c.json({ success: true });
});

// AI generation helper
async function generateBusinessPlan(apiKey: string, data: any) {
  const prompt = `Tu es un expert en création de plans d'affaires. Crée un plan d'affaires professionnel et complet pour l'entreprise suivante :

Nom: ${data.businessName}
Industrie: ${data.industry}
Description: ${data.description}
${data.goals ? `Objectifs: ${data.goals}` : ''}
${data.targetMarket ? `Marché cible: ${data.targetMarket}` : ''}

Génère un plan d'affaires structuré avec les sections suivantes en français :
1. Résumé exécutif
2. Description de l'entreprise
3. Analyse du marché
4. Stratégie marketing
5. Plan opérationnel
6. Prévisions financières (revenus, coûts, rentabilité)
7. Structure organisationnelle
8. Analyse des risques

Format: JSON avec les clés : executiveSummary, companyDescription, marketAnalysis, marketingStrategy, operationalPlan, financialProjections, organization, riskAnalysis`;

  try {
    const response = await fetch('https://api.kimi.com/coding/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'KimiCLI/0.77'
      },
      body: JSON.stringify({
        model: 'kimi-for-coding',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
    
    const result = await response.json();
    const content = (result as any).choices?.[0]?.message?.content;
    
    if (content) {
      try {
        return JSON.parse(content);
      } catch (e) {
        // Fallback if not valid JSON
        return { rawContent: content, sections: extractSections(content) };
      }
    }
  } catch (e) {
    console.error('AI generation error:', e);
  }
  
  // Fallback template
  return generateFallbackPlan(data);
}

function extractSections(content: string) {
  // Simple section extraction
  return {
    executiveSummary: content.substring(0, 500),
    fullContent: content
  };
}

function generateFallbackPlan(data: any) {
  return {
    executiveSummary: `Résumé exécutif pour ${data.businessName}. ${data.description}`,
    companyDescription: data.description,
    marketAnalysis: `Analyse du marché pour l'industrie ${data.industry}`,
    marketingStrategy: 'Stratégie marketing à définir',
    operationalPlan: 'Plan opérationnel à définir',
    financialProjections: {
      revenue: 'À estimer',
      costs: 'À estimer',
      profit: 'À estimer'
    },
    organization: 'Structure à définir',
    riskAnalysis: 'Risques à identifier',
    generatedAt: new Date().toISOString()
  };
}

export const apiRoutes = app;
