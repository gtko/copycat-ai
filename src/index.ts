import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { cors } from 'hono/cors';

// Routes
import { authRoutes } from './routes/auth';
import { stripeRoutes } from './routes/stripe';
import { apiRoutes } from './routes/api';

// Pages
import { landingPage } from './pages/landing';
import { checkoutPage } from './pages/checkout';
import { appPage } from './pages/app';

export type User = {
  id: number;
  email: string;
  name?: string;
  subscription_status?: string;
  trial_end_date?: string;
};

export type Env = {
  Bindings: {
    DB: D1Database;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_PUBLISHABLE_KEY: string;
    JWT_SECRET: string;
    KIMI_API_KEY: string;
    POSTHOG_KEY: string;
    POSTHOG_HOST: string;
    BETTERSTACK_TOKEN: string;
    APP_URL: string;
  };
  Variables: {
    user: User;
  };
};

const app = new Hono<Env>();

// Middleware
app.use('*', logger());
app.use('*', poweredBy());
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Static pages
app.get('/', (c) => c.html(landingPage(c.env.STRIPE_PUBLISHABLE_KEY)));
app.get('/checkout', (c) => c.html(checkoutPage(c.env.STRIPE_PUBLISHABLE_KEY)));
app.get('/success', (c) => c.html(successPage()));
app.get('/cancel', (c) => c.html(cancelPage()));

// App (protected)
app.get('/app', async (c) => {
  const auth = await checkAuth(c);
  if (!auth) return c.redirect('/');
  return c.html(appPage(c.env.STRIPE_PUBLISHABLE_KEY));
});
app.get('/app/*', async (c) => {
  const auth = await checkAuth(c);
  if (!auth) return c.redirect('/');
  return c.html(appPage(c.env.STRIPE_PUBLISHABLE_KEY));
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/stripe', stripeRoutes);
app.route('/api', apiRoutes);

// Auth helper
async function checkAuth(c: any): Promise<{ id: number; email: string } | null> {
  const sessionId = c.req.header('cookie')?.match(/session=([^;]+)/)?.[1] 
    ?? new URL(c.req.url).searchParams.get('token');
  
  if (!sessionId) return null;
  
  const session = await c.env.DB.prepare(
    'SELECT s.user_id, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime("now")'
  ).bind(sessionId).first();
  
  return session ? { id: session.user_id, email: session.email } : null;
}

// Page templates
function successPage() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paiement Réussi - Copycat AI</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="success-card">
      <div class="icon">✓</div>
      <h1>Paiement confirmé !</h1>
      <p>Votre essai de 48h commence maintenant.</p>
      <p class="subtitle">Vous serez facturé 49,90€ dans 2 jours sauf annulation.</p>
      <a href="/app" class="btn-primary">Accéder à l'application</a>
    </div>
  </div>
</body>
</html>`;
}

function cancelPage() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paiement Annulé - Copycat AI</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="cancel-card">
      <div class="icon">✕</div>
      <h1>Paiement annulé</h1>
      <p>Vous n'avez pas été facturé.</p>
      <a href="/" class="btn-secondary">Retour à l'accueil</a>
    </div>
  </div>
</body>
</html>`;
}

const commonStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .container { width: 100%; max-width: 500px; padding: 20px; }
  .success-card, .cancel-card { background: white; border-radius: 16px; padding: 48px 32px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .icon { width: 80px; height: 80px; border-radius: 50%; background: #10b981; color: white; font-size: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
  .cancel-card .icon { background: #ef4444; }
  h1 { font-size: 28px; color: #1f2937; margin-bottom: 16px; }
  p { font-size: 16px; color: #6b7280; margin-bottom: 8px; }
  .subtitle { font-size: 14px; color: #9ca3af; margin-bottom: 32px; }
  .btn-primary, .btn-secondary { display: inline-block; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: transform 0.2s; }
  .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
  .btn-secondary { background: #f3f4f6; color: #374151; }
  .btn-primary:hover, .btn-secondary:hover { transform: translateY(-2px); }
`;

export default app;
