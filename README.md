# Copycat AI

Clone de Venturekit - Générateur de plans d'affaires propulsé par l'IA.

## 🚀 Stack Technique

- **Backend**: Cloudflare Workers + Hono
- **Base de données**: Cloudflare D1 (SQLite)
- **Paiements**: Stripe (Trial 48h → Abonnement)
- **Analytics**: PostHog
- **Monitoring**: BetterStack
- **Auth**: JWT + Magic Links
- **AI**: Kimi API (ou OpenAI)

## 🎯 Fonctionnalités

### Landing Page
- Page d'accueil optimisée conversion
- Funnel de paiement agressif
- Social proof (stats, témoignages)

### Système de Paiement (Funnel Aggressif)
- **Trial**: 2,90€ pour 48h d'accès complet
- **Abonnement**: 49,90€ tous les 28 jours
- Gestion des annulations via Stripe Portal
- Webhooks Stripe pour synchronisation

### Application Core
- Wizard de création de plan d'affaires
- Génération IA (plan complet avec analyses)
- Stockage des plans dans D1
- Export PDF (à venir)

### Authentification
- Magic links (pas de mot de passe)
- Sessions avec cookies HttpOnly
- Protection des routes

## 📁 Structure

```
src/
├── index.ts          # Entry point + routes
├── routes/
│   ├── auth.ts       # Auth (login, logout, me)
│   ├── stripe.ts     # Paiements + webhooks
│   └── api.ts        # API métier (generate, plans)
├── pages/
│   ├── landing.ts    # Landing page HTML
│   ├── checkout.ts   # Page de paiement
│   └── app.ts        # Application SPA
└── db/
    └── schema.sql    # Schéma D1
```

## 🛠️ Setup Local

```bash
# Installation
npm install

# Configurer les secrets locaux
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put JWT_SECRET
wrangler secret put KIMI_API_KEY

# Créer la base de données D1
wrangler d1 create copycat-ai-db
# Copier l'ID dans wrangler.toml

# Appliquer le schéma
wrangler d1 execute copycat-ai-db --file=./src/db/schema.sql

# Démarrer le dev server
npm run dev
```

## 🚀 Déploiement

Le déploiement est automatique via GitHub Actions sur chaque push sur `main`.

### Secrets GitHub à configurer:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`
- `KIMI_API_KEY`

## 📊 Monitoring

### PostHog
Événements trackés:
- `page_view`
- `checkout_started`
- `payment_completed`
- `plan_generated`

### BetterStack
Health check sur `/health`

## 🔗 Liens Utiles

- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [PostHog](https://eu.posthog.com)
- [BetterStack](https://betterstack.com)

## 📝 TODO

Voir [TODO.md](./TODO.md) pour la roadmap.
