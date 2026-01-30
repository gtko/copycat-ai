export function appPage(stripeKey: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application - Copycat AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; min-height: 100vh; }
    
    /* Layout */
    .app { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
    @media (max-width: 768px) { .app { grid-template-columns: 1fr; } .sidebar { display: none; } }
    
    /* Sidebar */
    .sidebar { background: #1a1a2e; color: white; padding: 24px; }
    .sidebar-logo { font-size: 20px; font-weight: 800; margin-bottom: 32px; }
    .nav-section { margin-bottom: 24px; }
    .nav-section-title { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 12px; letter-spacing: 0.5px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); }
    .nav-item-icon { font-size: 20px; }
    .trial-badge { background: #fbbf24; color: #1f2937; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: auto; }
    
    /* Main */
    .main { padding: 32px; overflow-y: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .header h1 { font-size: 28px; }
    .user-menu { display: flex; align-items: center; gap: 16px; }
    .btn-secondary { padding: 10px 20px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-secondary:hover { background: #f9fafb; }
    
    /* Cards */
    .card { background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-title { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    .card-subtitle { color: #6b7280; margin-bottom: 24px; }
    
    /* Wizard */
    .wizard { display: none; }
    .wizard.active { display: block; }
    .form-group { margin-bottom: 20px; }
    label { display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px; }
    input, textarea, select { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; transition: border-color 0.2s; font-family: inherit; }
    input:focus, textarea:focus, select:focus { outline: none; border-color: #667eea; }
    textarea { min-height: 120px; resize: vertical; }
    .btn-primary { padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    
    /* Plans Grid */
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .plan-card { background: white; border-radius: 12px; padding: 24px; border: 2px solid #e5e7eb; cursor: pointer; transition: all 0.2s; }
    .plan-card:hover { border-color: #667eea; transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .plan-card h3 { font-size: 18px; margin-bottom: 8px; }
    .plan-card p { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
    .plan-meta { display: flex; gap: 16px; font-size: 13px; color: #9ca3af; }
    
    /* Plan View */
    .plan-view { display: none; }
    .plan-view.active { display: block; }
    .plan-section { margin-bottom: 32px; }
    .plan-section h2 { font-size: 24px; margin-bottom: 16px; color: #1a1a2e; }
    .plan-section p { color: #4b5563; line-height: 1.8; }
    .plan-section ul { margin: 16px 0; padding-left: 24px; }
    .plan-section li { margin: 8px 0; color: #4b5563; }
    
    /* Loading */
    .loading { text-align: center; padding: 60px; }
    .spinner { width: 50px; height: 50px; border: 4px solid #e5e7eb; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* Empty State */
    .empty-state { text-align: center; padding: 60px; }
    .empty-icon { font-size: 64px; margin-bottom: 24px; }
    .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
    .empty-state p { color: #6b7280; margin-bottom: 24px; }
    
    /* Alert Banner */
    .alert-banner { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1f2937; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .alert-banner a { color: #1f2937; font-weight: 600; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-logo">🚀 Copycat AI</div>
      
      <div class="nav-section">
        <div class="nav-section-title">Menu</div>
        <div class="nav-item active" onclick="showSection('dashboard')">
          <span class="nav-item-icon">📊</span>
          <span>Tableau de bord</span>
        </div>
        <div class="nav-item" onclick="showSection('new')">
          <span class="nav-item-icon">✨</span>
          <span>Nouveau plan</span>
        </div>
        <div class="nav-item" onclick="showSection('plans')">
          <span class="nav-item-icon">📋</span>
          <span>Mes plans</span>
        </div>
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">Compte</div>
        <div class="nav-item" onclick="showSection('settings')">
          <span class="nav-item-icon">⚙️</span>
          <span>Paramètres</span>
          <span class="trial-badge" id="trial-badge">TRIAL</span>
        </div>
        <div class="nav-item" onclick="logout()">
          <span class="nav-item-icon">🚪</span>
          <span>Déconnexion</span>
        </div>
      </div>
    </aside>
    
    <main class="main">
      <div class="header">
        <h1 id="page-title">Tableau de bord</h1>
        <div class="user-menu">
          <span id="user-email"></span>
          <button class="btn-secondary" onclick="showSection('new')">+ Nouveau plan</button>
        </div>
      </div>
      
      <!-- Alert Banner -->
      <div class="alert-banner" id="trial-alert">
        <span>⏰ Il vous reste <strong id="trial-days">48h</strong> d'essai. Passez à l'abonnement pour continuer.</span>
        <a href="#" onclick="openBilling()">Gérer l'abonnement →</a>
      </div>
      
      <!-- Dashboard -->
      <div id="dashboard" class="section active">
        <div class="card">
          <h2 class="card-title">Bienvenue sur Copycat AI ! 👋</h2>
          <p class="card-subtitle">Créez votre premier plan d'affaires en quelques minutes</p>
          <button class="btn-primary" onclick="showSection('new')">Créer mon premier plan</button>
        </div>
        
        <div class="card">
          <h2 class="card-title">Comment ça marche ?</h2>
          <p class="card-subtitle">3 étapes simples pour créer votre plan d'affaires</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
            <div style="text-align: center;">
              <div style="font-size: 40px; margin-bottom: 12px;">1️⃣</div>
              <h4>Décrivez votre projet</h4>
              <p style="color: #6b7280; font-size: 14px;">Nom, industrie, description de votre business</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 40px; margin-bottom: 12px;">2️⃣</div>
              <h4>L'IA génère votre plan</h4>
              <p style="color: #6b7280; font-size: 14px;">Analyse de marché, stratégie, finances...</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 40px; margin-bottom: 12px;">3️⃣</div>
              <h4>Téléchargez en PDF</h4>
              <p style="color: #6b7280; font-size: 14px;">Exportez et présentez à vos partenaires</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- New Plan Wizard -->
      <div id="new-plan" class="section wizard">
        <div class="card">
          <h2 class="card-title">Créer un nouveau plan d'affaires</h2>
          <p class="card-subtitle">Remplissez les informations ci-dessous pour générer votre plan</p>
          
          <form id="plan-form">
            <div class="form-group">
              <label for="businessName">Nom de l'entreprise *</label>
              <input type="text" id="businessName" required placeholder="Ex: TechStart Solutions">
            </div>
            
            <div class="form-group">
              <label for="industry">Secteur d'activité *</label>
              <select id="industry" required>
                <option value="">Sélectionnez...</option>
                <option value="technology">Technologie / SaaS</option>
                <option value="ecommerce">E-commerce</option>
                <option value="restaurant">Restauration</option>
                <option value="retail">Commerce de détail</option>
                <option value="services">Services professionnels</option>
                <option value="manufacturing">Industrie / Fabrication</option>
                <option value="healthcare">Santé / Bien-être</option>
                <option value="education">Éducation / Formation</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="description">Description du projet *</label>
              <textarea id="description" required placeholder="Décrivez votre projet en quelques phrases. Quel problème résolvez-vous ? Quelle est votre solution ?"></textarea>
            </div>
            
            <div class="form-group">
              <label for="goals">Objectifs (optionnel)</label>
              <input type="text" id="goals" placeholder="Ex: Atteindre 100k€ de CA la première année">
            </div>
            
            <div class="form-group">
              <label for="targetMarket">Marché cible (optionnel)</label>
              <input type="text" id="targetMarket" placeholder="Ex: PME du secteur retail en France">
            </div>
            
            <button type="submit" class="btn-primary" id="generate-btn">
              ✨ Générer mon plan d'affaires
            </button>
          </form>
          
          <div class="loading" id="generating" style="display: none;">
            <div class="spinner"></div>
            <h3>Génération en cours...</h3>
            <p style="color: #6b7280;">Notre IA analyse votre projet et crée un plan sur mesure. Cela peut prendre 1-2 minutes.</p>
          </div>
        </div>
      </div>
      
      <!-- My Plans -->
      <div id="my-plans" class="section">
        <div id="plans-list"></div>
        <div class="empty-state" id="empty-plans" style="display: none;">
          <div class="empty-icon">📋</div>
          <h3>Aucun plan d'affaires</h3>
          <p>Créez votre premier plan d'affaires maintenant</p>
          <button class="btn-primary" onclick="showSection('new')">Créer un plan</button>
        </div>
      </div>
      
      <!-- Plan View -->
      <div id="plan-view" class="section plan-view">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 id="view-plan-title">Plan d'affaires</h2>
            <div>
              <button class="btn-secondary" onclick="showSection('plans')">← Retour</button>
              <button class="btn-primary" style="margin-left: 12px;" onclick="exportPDF()">📄 Export PDF</button>
            </div>
          </div>
          <div id="plan-content"></div>
        </div>
      </div>
      
      <!-- Settings -->
      <div id="settings" class="section">
        <div class="card">
          <h2 class="card-title">Paramètres de l'abonnement</h2>
          <p class="card-subtitle">Gérez votre abonnement et vos informations de paiement</p>
          
          <div style="background: #f9fafb; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h4>Plan actuel</h4>
            <p style="font-size: 24px; font-weight: 700; color: #667eea; margin: 8px 0;">Essai 48h</p>
            <p style="color: #6b7280;">Puis 49,90€ tous les 28 jours</p>
          </div>
          
          <button class="btn-secondary" onclick="openBilling()">Gérer mon abonnement Stripe</button>
        </div>
      </div>
    </main>
  </div>

  <script>
    // State
    let currentUser = null;
    let plans = [];
    let currentPlan = null;
    
    // Init
    document.addEventListener('DOMContentLoaded', async () => {
      await loadUser();
      await loadPlans();
    });
    
    // Load user
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          currentUser = data.user;
          document.getElementById('user-email').textContent = data.user.email;
          
          // Check trial status
          if (data.user.subscription_status === 'active') {
            document.getElementById('trial-alert').style.display = 'none';
            document.getElementById('trial-badge').style.display = 'none';
          } else if (data.user.trial_end_date) {
            const daysLeft = Math.ceil((new Date(data.user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24));
            document.getElementById('trial-days').textContent = daysLeft + 'h';
          }
        } else {
          window.location.href = '/';
        }
      } catch (e) {
        window.location.href = '/';
      }
    }
    
    // Load plans
    async function loadPlans() {
      try {
        const res = await fetch('/api/plans');
        const data = await res.json();
        plans = data.plans || [];
        renderPlans();
      } catch (e) {
        console.error('Failed to load plans:', e);
      }
    }
    
    // Render plans
    function renderPlans() {
      const container = document.getElementById('plans-list');
      const empty = document.getElementById('empty-plans');
      
      if (plans.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      
      empty.style.display = 'none';
      container.innerHTML = '<div class="plans-grid">' + plans.map(plan => \`
        <div class="plan-card" onclick="viewPlan(\${plan.id})">
          <h3>\${plan.title}</h3>
          <p>\${plan.industry || 'Non spécifié'}</p>
          <div class="plan-meta">
            <span>📅 \${new Date(plan.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      \`).join('') + '</div>';
    }
    
    // View plan
    async function viewPlan(id) {
      const plan = plans.find(p => p.id === id);
      if (!plan) return;
      
      currentPlan = plan;
      document.getElementById('view-plan-title').textContent = plan.title;
      
      // Load full content
      try {
        const res = await fetch(\`/api/plans/\${id}\`);
        const data = await res.json();
        const content = data.plan?.content || {};
        
        let html = '';
        
        if (content.executiveSummary) {
          html += \`<div class="plan-section"><h2>📋 Résumé exécutif</h2><p>\${content.executiveSummary}</p></div>\`;
        }
        if (content.companyDescription) {
          html += \`<div class="plan-section"><h2>🏢 Description de l'entreprise</h2><p>\${content.companyDescription}</p></div>\`;
        }
        if (content.marketAnalysis) {
          html += \`<div class="plan-section"><h2>📊 Analyse du marché</h2><p>\${content.marketAnalysis}</p></div>\`;
        }
        if (content.marketingStrategy) {
          html += \`<div class="plan-section"><h2>🎯 Stratégie marketing</h2><p>\${content.marketingStrategy}</p></div>\`;
        }
        if (content.financialProjections) {
          html += \`<div class="plan-section"><h2>💰 Prévisions financières</h2><p>\${JSON.stringify(content.financialProjections, null, 2).replace(/\\n/g, '<br>')}</p></div>\`;
        }
        
        document.getElementById('plan-content').innerHTML = html || '<p>Aucun contenu disponible</p>';
        showSection('view');
      } catch (e) {
        alert('Erreur lors du chargement du plan');
      }
    }
    
    // Generate plan
    document.getElementById('plan-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('generate-btn');
      const loading = document.getElementById('generating');
      const form = document.getElementById('plan-form');
      
      btn.disabled = true;
      form.style.display = 'none';
      loading.style.display = 'block';
      
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: document.getElementById('businessName').value,
            industry: document.getElementById('industry').value,
            description: document.getElementById('description').value,
            goals: document.getElementById('goals').value,
            targetMarket: document.getElementById('targetMarket').value
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          await loadPlans();
          viewPlan(data.planId);
        } else {
          throw new Error(data.error);
        }
      } catch (e) {
        alert('Erreur: ' + e.message);
        btn.disabled = false;
        form.style.display = 'block';
        loading.style.display = 'none';
      }
    });
    
    // Navigation
    function showSection(section) {
      // Hide all
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      
      // Show target
      const titles = {
        dashboard: 'Tableau de bord',
        new: 'Nouveau plan',
        plans: 'Mes plans',
        settings: 'Paramètres',
        view: 'Plan d\'affaires'
      };
      
      document.getElementById('page-title').textContent = titles[section] || 'Copycat AI';
      
      if (section === 'new') {
        document.getElementById('new-plan').classList.add('active');
      } else if (section === 'plans') {
        document.getElementById('my-plans').classList.add('active');
      } else if (section === 'settings') {
        document.getElementById('settings').classList.add('active');
      } else if (section === 'view') {
        document.getElementById('plan-view').classList.add('active');
      } else {
        document.getElementById('dashboard').classList.add('active');
      }
    }
    
    // Billing portal
    async function openBilling() {
      try {
        const res = await fetch('/api/stripe/portal', { method: 'POST' });
        const data = await res.json();
        if (data.url) {
          window.open(data.url, '_blank');
        }
      } catch (e) {
        alert('Erreur lors de l\'ouverture du portail');
      }
    }
    
    // Export PDF
    function exportPDF() {
      alert('Export PDF - Fonctionnalité à venir');
    }
    
    // Logout
    async function logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    }
  </script>
  
  <!-- PostHog -->
  <script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('${stripeKey}',{api_host:'https://eu.i.posthog.com', person_profiles: 'identified_only'});
  </script>
</body>
</html>`;
}
