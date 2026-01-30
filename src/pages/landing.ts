export function landingPage(stripeKey: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copycat AI - Générateur de Plans d'Affaires IA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a2e; line-height: 1.6; }
    
    /* Header */
    header { position: fixed; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); z-index: 100; border-bottom: 1px solid #e5e7eb; }
    nav { max-width: 1200px; margin: 0 auto; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-links a { text-decoration: none; color: #4b5563; font-weight: 500; }
    .nav-links a:hover { color: #667eea; }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 12px 24px; border-radius: 8px; font-weight: 600; }
    
    /* Hero */
    .hero { padding: 160px 24px 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; }
    .hero h1 { font-size: 56px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; max-width: 800px; margin-left: auto; margin-right: auto; }
    .hero p { font-size: 20px; opacity: 0.9; max-width: 600px; margin: 0 auto 40px; }
    .hero-cta { display: inline-flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
    .btn-large { padding: 20px 40px; font-size: 18px; border-radius: 12px; font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
    .btn-large:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
    .btn-white { background: white; color: #667eea; }
    .btn-outline { background: transparent; color: white; border: 2px solid white; }
    .trustpilot { margin-top: 40px; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 14px; opacity: 0.9; }
    
    /* Pricing Banner */
    .pricing-banner { background: #fbbf24; color: #1f2937; padding: 16px; text-align: center; font-weight: 600; }
    
    /* Features */
    .features { padding: 100px 24px; max-width: 1200px; margin: 0 auto; }
    .section-title { text-align: center; font-size: 40px; font-weight: 700; margin-bottom: 16px; }
    .section-subtitle { text-align: center; color: #6b7280; font-size: 18px; max-width: 600px; margin: 0 auto 64px; }
    
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 32px; }
    .feature-card { padding: 32px; border-radius: 16px; background: #f9fafb; border: 1px solid #e5e7eb; }
    .feature-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; }
    .feature-card h3 { font-size: 20px; font-weight: 600; margin-bottom: 12px; }
    .feature-card p { color: #6b7280; }
    
    /* Stats */
    .stats { background: #1a1a2e; color: white; padding: 80px 24px; }
    .stats-grid { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 48px; text-align: center; }
    .stat h3 { font-size: 48px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .stat p { color: #9ca3af; margin-top: 8px; }
    
    /* Pricing */
    .pricing { padding: 100px 24px; max-width: 800px; margin: 0 auto; text-align: center; }
    .pricing-card { background: white; border-radius: 24px; padding: 48px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); border: 2px solid #667eea; }
    .pricing-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
    .price { font-size: 64px; font-weight: 800; color: #1a1a2e; }
    .price span { font-size: 20px; font-weight: 500; color: #6b7280; }
    .pricing-features { text-align: left; max-width: 400px; margin: 32px auto; }
    .pricing-features li { list-style: none; padding: 12px 0; display: flex; align-items: center; gap: 12px; }
    .pricing-features li::before { content: "✓"; color: #10b981; font-weight: 700; }
    .btn-full { width: 100%; padding: 20px; font-size: 18px; }
    
    /* Footer */
    footer { background: #1a1a2e; color: #9ca3af; padding: 64px 24px 32px; text-align: center; }
    footer p { margin-bottom: 16px; }
    
    /* Mobile */
    @media (max-width: 768px) {
      .hero h1 { font-size: 36px; }
      .hero p { font-size: 18px; }
      .nav-links { display: none; }
      .features-grid { grid-template-columns: 1fr; }
      .price { font-size: 48px; }
    }
  </style>
</head>
<body>
  <!-- Pricing Banner -->
  <div class="pricing-banner">
    🔥 OFFRE LIMITÉE : Essai 48h à 2,90€ seulement, puis 49,90€/28jours - Annulez quand vous voulez
  </div>

  <!-- Header -->
  <header>
    <nav>
      <div class="logo">🚀 Copycat AI</div>
      <div class="nav-links">
        <a href="#features">Fonctionnalités</a>
        <a href="#pricing">Tarifs</a>
        <a href="/checkout" class="btn-primary">Commencer maintenant</a>
      </div>
    </nav>
  </header>

  <!-- Hero -->
  <section class="hero">
    <h1>Créez un plan d'affaires gagnant en quelques minutes avec l'IA</h1>
    <p>Générez un plan d'affaires professionnel, des prévisions financières et une présentation projet complète. Sans compétences requises.</p>
    <div class="hero-cta">
      <a href="/checkout" class="btn-large btn-white">Démarrer mon essai à 2,90€</a>
      <a href="#features" class="btn-large btn-outline">Voir comment ça marche</a>
    </div>
    <div class="trustpilot">
      <span>⭐⭐⭐⭐⭐</span>
      <span>Trustpilot Excellent 4.8/5</span>
      <span>• Plus de 10,000 entrepreneurs satisfaits</span>
    </div>
  </section>

  <!-- Features -->
  <section class="features" id="features">
    <h2 class="section-title">Tout ce dont vous avez besoin pour réussir</h2>
    <p class="section-subtitle">Des outils simples et puissants pour transformer votre idée en entreprise prospère</p>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">📋</div>
        <h3>Plan d'affaires IA</h3>
        <p>Générez un plan d'affaires complet de 28 pages en quelques minutes. Analyse de marché, stratégie, finances - tout y est.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Prévisions financières</h3>
        <p>Obtenez des projections financières détaillées : chiffre d'affaires, dépenses, bilan, compte de résultat.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>Recherche de marché</h3>
        <p>Analysez votre marché cible, votre concurrence et vos opportunités avec des données pertinentes.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📈</div>
        <h3>Présentation projet</h3>
        <p>Créez un pitch deck professionnel pour convaincre investisseurs et partenaires.</p>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section class="stats">
    <div class="stats-grid">
      <div class="stat">
        <h3>28</h3>
        <p>pages de contenu</p>
      </div>
      <div class="stat">
        <h3>82h</h3>
        <p>économisées en moyenne</p>
      </div>
      <div class="stat">
        <h3>3x</h3>
        <p>plus de chances d'obtenir un prêt</p>
      </div>
      <div class="stat">
        <h3>10k+</h3>
        <p>entrepreneurs aidés</p>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section class="pricing" id="pricing">
    <h2 class="section-title">Commencez dès maintenant</h2>
    <p class="section-subtitle">Essayez sans risque pendant 48h</p>
    
    <div class="pricing-card">
      <span class="pricing-badge">🔥 OFFRE DE LANCEMENT</span>
      <div class="price">2,90€ <span>/ 48h d'essai</span></div>
      <p style="color: #6b7280; margin: 16px 0;">Puis 49,90€ tous les 28 jours • Annulation gratuite</p>
      
      <ul class="pricing-features">
        <li>Plan d'affaires illimités</li>
        <li>Prévisions financières complètes</li>
        <li>Recherche de marché IA</li>
        <li>Pitch deck généré automatiquement</li>
        <li>Export PDF haute qualité</li>
        <li>Support par email</li>
      </ul>
      
      <a href="/checkout" class="btn-primary btn-large btn-full">Démarrer mon essai à 2,90€</a>
      <p style="font-size: 14px; color: #9ca3af; margin-top: 16px;">Annulez à tout moment pendant l'essai • Aucun engagement</p>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <p>© 2026 Copycat AI. Tous droits réservés.</p>
    <p>Propulsé par l'intelligence artificielle</p>
  </footer>

  <!-- PostHog -->
  <script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('${stripeKey}',{api_host:'https://eu.i.posthog.com', person_profiles: 'identified_only'});
  </script>
</body>
</html>`;
}
