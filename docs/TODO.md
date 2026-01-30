# TODO & Roadmap

## 🚀 MVP (En cours)

### Core Features
- [x] Landing page avec CTA
- [x] Funnel de paiement Stripe
- [x] Auth magic links
- [x] Wizard de création de plan
- [x] Génération IA basique
- [x] Stockage D1
- [ ] Export PDF des plans
- [ ] Page de connexion dédiée

### Tech
- [x] Setup Cloudflare Workers
- [x] Setup D1 database
- [x] Stripe integration
- [ ] PostHog tracking
- [ ] BetterStack monitoring
- [ ] CI/CD GitHub Actions
- [ ] Tests basiques

## 📋 V1.1 (Prochainement)

### Features
- [ ] Export PDF professionnel
- [ ] Templates de plans (restaurant, SaaS, etc.)
- [ ] Éditeur de plan (modifier après génération)
- [ ] Prévisions financières détaillées
- [ ] Pitch deck generator
- [ ] Recherche de marché approfondie

### Améliorations
- [ ] UI/UX plus polishée
- [ ] Mobile app (PWA)
- [ ] Multilingue (EN, ES)
- [ ] Dark mode
- [ ] Animations

## 🎯 V2.0 (Future)

### Nouveaux Produits
- [ ] Formation LLC (US)
- [ ] Registered Agent service
- [ ] Comptabilité intégrée
- [ ] Marketplace de templates
- [ ] Coaching 1-on-1

### Enterprise
- [ ] Multi-utilisateur (équipes)
- [ ] API publique
- [ ] White-label
- [ ] SSO

## 🔧 Tech Debt

- [ ] Migration vers proper ORM (Drizzle?)
- [ ] Tests e2e (Playwright)
- [ ] Rate limiting
- [ ] Input validation stricte
- [ ] Error tracking (Sentry)
- [ ] Caching layer (KV)
- [ ] CDN pour assets statiques

## 🐛 Bugs Connus

- [ ] La génération IA peut timeout si réponse longue
- [ ] Pas de retry sur erreurs Stripe webhook
- [ ] UI pas optimisée mobile sur certaines pages

## 💡 Idées

- Intégration avec Notion pour export
- Intégration Google Docs
- Template personnalisé avec logo
- Video pitch generator
- Chat avec l'IA pour modifier le plan
- Benchmark contre concurrents
- Social proof automatisé
- Referral program
