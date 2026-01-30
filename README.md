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

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Mode watch (développement)
npm test -- --watch

# Avec coverage
npm test -- --coverage
```

Voir [docs/TESTS.md](./docs/TESTS.md) pour la documentation complète.

## 🛠️ Setup Local

### 1. Installation

```bash
npm install
```

### 2. Configuration des Secrets

**Option A : Script automatisé (recommandé)**

```bash
# Configuration interactive de tous les secrets
./scripts/setup-secrets.sh --local
```

**Option B : Manuellement**

```bash
# Configurer les secrets un par un
wrangler secret put STRIPE_SECRET_KEY --local
wrangler secret put STRIPE_WEBHOOK_SECRET --local
wrangler secret put JWT_SECRET --local
wrangler secret put KIMI_API_KEY --local
```

Les secrets requis sont :
- `STRIPE_SECRET_KEY` - Clé secrète Stripe (sk_...)
- `STRIPE_WEBHOOK_SECRET` - Secret webhook Stripe (whsec_...)
- `JWT_SECRET` - Secret pour signer les JWT (générez une chaîne aléatoire)
- `KIMI_API_KEY` - Clé API pour l'IA (ou `OPENAI_API_KEY`)

### 3. Configuration Stripe (Produits & Webhooks)

**Automatisé (recommandé)**

```bash
# Setup complet : produit, prix, webhook
export STRIPE_SECRET_KEY=sk_test_...
npm run setup:stripe
```

Ce script crée :
- ✅ Produit "Copycat AI - Essai 48h"
- ✅ Prix : 2,90€ trial puis 49,90€/28jours
- ✅ Webhook endpoint
- ✅ Sauvegarde du webhook secret

**Manuel**

Voir [docs/STRIPE.md](./docs/STRIPE.md) pour les instructions détaillées.

### 4. Base de données D1

```bash
# Créer la base de données
npm run db:create
# Copier l'ID affiché dans wrangler.toml (champ database_id)

# Appliquer le schéma
npm run db:schema
```

### 5. Variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .dev.vars
# Éditer .dev.vars avec vos valeurs
```

### 6. Lancer le serveur

```bash
npm run dev
# Ouvrir http://localhost:8787
```

## 🚀 Déploiement Production

### 1. Secrets Cloudflare (Production)

```bash
# Configurer les secrets pour la production
npm run setup:secrets:prod
```

Ou manuellement :
```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put JWT_SECRET
wrangler secret put KIMI_API_KEY
```

### 2. Configuration Stripe (Production)

```bash
# Créer les produits et webhooks en production
export STRIPE_SECRET_KEY=sk_live_...
export APP_URL=https://votre-domaine.com
npm run setup:stripe:prod

# Sauvegarder le webhook secret
wrangler secret put STRIPE_WEBHOOK_SECRET
```

### 3. Variables dans wrangler.toml

Éditer `wrangler.toml` et remplacer :
- `STRIPE_PUBLISHABLE_KEY` - Clé publique Stripe (pk_live_...)
- `POSTHOG_KEY` - Clé PostHog
- `BETTERSTACK_TOKEN` - Token BetterStack
- `APP_URL` - URL de votre application
- `database_id` - ID de la base D1 créée

### 4. Base de données D1 (Production)

```bash
# Créer la base de données de production
wrangler d1 create copycat-ai-db
# Copier l'ID dans wrangler.toml

# Appliquer le schéma
npm run db:schema:prod
```

### 4. Déploiement Automatique (GitHub Actions)

Le déploiement est automatique sur chaque push sur `main`.

**Secrets GitHub requis** (Settings > Secrets and variables > Actions):
| Secret | Description | Où le trouver |
|--------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare | [Cloudflare Tokens](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID` | ID du compte Cloudflare | Dashboard > droite, Account ID |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook | Stripe > Webhooks > Signing secret |
| `JWT_SECRET` | Secret JWT | Générez: `openssl rand -base64 32` |
| `KIMI_API_KEY` | Clé API Kimi | Dashboard Kimi |

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
