# Copycat AI - MVP SaaS

## 📋 Résumé du Projet

Clone de **Venturekit** - Générateur de plans d'affaires propulsé par l'IA.

### 🎯 Funnel de Prix (Aggressif)
- **Trial**: 2,90€ pour 48h d'accès complet
- **Abonnement**: 49,90€ tous les 28 jours
- **Stratégie**: Low friction entry → High retention

### 🛠️ Stack Technique
- **Cloudflare Workers** + Hono
- **D1 Database** (SQLite)
- **Stripe** (paiements + webhooks)
- **PostHog** (analytics)
- **BetterStack** (monitoring)
- **Kimi API** (génération IA)

### 📁 Structure
```
/Users/gtko/copycat-ai/
├── src/
│   ├── index.ts           # Entry point
│   ├── routes/            # API routes (auth, stripe, api)
│   ├── pages/             # HTML pages (landing, checkout, app)
│   └── db/schema.sql      # Database schema
├── docs/                  # Documentation
├── stripe/products.json   # Stripe config
├── .github/workflows/     # CI/CD
└── wrangler.toml          # Cloudflare config
```

### 🔗 Liens
- **Repo GitHub**: https://github.com/gtko/copycat-ai
- **Issues créées**: 7 issues pour la roadmap

### 🚀 Prochaines Étapes
1. Configurer les secrets Cloudflare (`wrangler secret put`)
2. Créer les produits Stripe
3. Créer la base de données D1
4. Déployer avec `wrangler deploy`
5. Configurer webhooks Stripe
6. Setup PostHog & BetterStack

### 📊 Business Model
- **LTV estimé**: ~103€ par client
- **Conversion trial→paid attendue**: 30%
- **Target CAC**: <34€

### ⚠️ Limitations connues
- Génération IA peut timeout (>30s)
- Pas d'export PDF encore
- Pas de tests automatisés

---
Créé le: 2026-01-30
