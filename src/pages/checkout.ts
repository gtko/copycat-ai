export function checkoutPage(stripeKey: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Finaliser votre inscription - Copycat AI</title>
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; min-height: 100vh; }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 24px; display: grid; grid-template-columns: 1fr 400px; gap: 48px; }
    @media (max-width: 900px) { .container { grid-template-columns: 1fr; } }
    
    .card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    
    .logo { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 32px; }
    
    h1 { font-size: 28px; margin-bottom: 8px; }
    .subtitle { color: #6b7280; margin-bottom: 32px; }
    
    .form-group { margin-bottom: 20px; }
    label { display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px; }
    input { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; transition: border-color 0.2s; }
    input:focus { outline: none; border-color: #667eea; }
    
    .btn-primary { width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    
    .secure-note { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; font-size: 14px; color: #6b7280; }
    
    /* Summary */
    .summary h2 { font-size: 20px; margin-bottom: 24px; }
    .summary-item { display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #e5e7eb; }
    .summary-item:last-child { border-bottom: none; font-weight: 600; font-size: 18px; }
    .price-highlight { color: #667eea; font-weight: 700; }
    
    .trial-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 24px; }
    .trial-box h3 { font-size: 16px; margin-bottom: 8px; }
    .trial-box p { font-size: 14px; color: #92400e; }
    
    .guarantee { display: flex; gap: 12px; margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; }
    .guarantee-icon { font-size: 24px; }
    .guarantee h4 { font-size: 14px; margin-bottom: 4px; }
    .guarantee p { font-size: 13px; color: #6b7280; }
    
    .testimonial { margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .testimonial p { font-style: italic; color: #4b5563; margin-bottom: 12px; }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .testimonial-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
    
    .loading { display: none; text-align: center; padding: 40px; }
    .loading.active { display: block; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .error { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 8px; margin-bottom: 16px; display: none; }
    .error.active { display: block; }
  </style>
</head>
<body>
  <div class="container">
    <div>
      <div class="card">
        <div class="logo">🚀 Copycat AI</div>
        
        <div id="checkout-form">
          <h1>Finalisez votre inscription</h1>
          <p class="subtitle">Commencez votre essai de 48h pour seulement 2,90€</p>
          
          <div class="error" id="error"></div>
          
          <form id="payment-form">
            <div class="form-group">
              <label for="name">Nom complet</label>
              <input type="text" id="name" required placeholder="Jean Dupont">
            </div>
            
            <div class="form-group">
              <label for="email">Adresse email</label>
              <input type="email" id="email" required placeholder="jean@exemple.com">
            </div>
            
            <button type="submit" class="btn-primary" id="submit-btn">
              Payer 2,90€ et commencer →
            </button>
          </form>
          
          <div class="secure-note">
            <span>🔒</span>
            <span>Paiement sécurisé par Stripe • SSL 256-bit</span>
          </div>
        </div>
        
        <div class="loading" id="loading">
          <div class="spinner"></div>
          <p>Redirection vers le paiement sécurisé...</p>
        </div>
      </div>
    </div>
    
    <div>
      <div class="card summary">
        <h2>Récapitulatif</h2>
        
        <div class="trial-box">
          <h3>🔥 Offre spéciale lancement</h3>
          <p>Essai de 48h à 2,90€ puis 49,90€ tous les 28 jours. Annulez quand vous voulez.</p>
        </div>
        
        <div class="summary-item">
          <span>Essai 48h Copycat AI</span>
          <span class="price-highlight">2,90€</span>
        </div>
        <div class="summary-item">
          <span>Puis abonnement</span>
          <span>49,90€ / 28j</span>
        </div>
        <div class="summary-item">
          <span>Total aujourd'hui</span>
          <span class="price-highlight">2,90€</span>
        </div>
        
        <div class="guarantee">
          <span class="guarantee-icon">✓</span>
          <div>
            <h4>Garantie satisfait ou remboursé</h4>
            <p>Annulez pendant l'essai de 48h et ne payez rien de plus.</p>
          </div>
        </div>
      </div>
      
      <div class="card testimonial">
        <p>"J'ai créé mon plan d'affaires en 10 minutes et j'ai obtenu mon prêt bancaire la semaine suivante. Incroyable !"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">MD</div>
          <div>
            <strong>Marie D.</strong>
            <p style="font-size: 13px; color: #6b7280;">Fondatrice de BioCosmetics</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('payment-form');
    const loading = document.getElementById('loading');
    const checkoutForm = document.getElementById('checkout-form');
    const errorDiv = document.getElementById('error');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const submitBtn = document.getElementById('submit-btn');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Chargement...';
      errorDiv.classList.remove('active');
      
      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name })
        });
        
        const data = await response.json();
        
        if (data.url) {
          checkoutForm.style.display = 'none';
          loading.classList.add('active');
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Erreur lors de la création de la session');
        }
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.add('active');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Payer 2,90€ et commencer →';
      }
    });
  </script>
</body>
</html>`;
}
