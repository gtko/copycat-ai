# Architecture

## Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │   Checkout   │  │     App      │      │
│  │    Page      │  │    Page      │  │    (SPA)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Workers                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                     Hono App                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │  Auth    │  │  Stripe  │  │  API (generate)  │   │   │
│  │  │  Routes  │  │  Routes  │  │  Routes          │   │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                   │
│         ┌───────────────┼───────────────┐                   │
│         ▼               ▼               ▼                   │
│    ┌─────────┐    ┌──────────┐    ┌──────────┐             │
│    │   D1    │    │  Stripe  │    │   Kimi   │             │
│    │  (SQL)  │    │   API    │    │   API    │             │
│    └─────────┘    └──────────┘    └──────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Flux de Données

### 1. Inscription & Paiement
```
1. User visite Landing Page
2. Click "Commencer" → Checkout Page
3. Formulaire email/nom
4. POST /api/stripe/checkout
   - Crée customer Stripe
   - Crée checkout session avec trial 48h
5. Redirection Stripe Checkout
6. Paiement 2,90€
7. Webhook checkout.session.completed
   - Met à jour user: subscription_status = 'trialing'
   - trial_end_date = +48h
8. Redirection /success → /app
```

### 2. Génération de Plan
```
1. User dans /app → Wizard
2. Remplit formulaire (nom, industrie, description)
3. POST /api/generate
4. Auth middleware vérifie subscription active
5. Appel API Kimi avec prompt structuré
6. Réponse JSON parsée
7. Stockage dans D1 (business_plans table)
8. Retour au client avec planId
9. Affichage du plan généré
```

### 3. Renouvellement / Annulation
```
1. Stripe envoie webhook invoice.paid
2. Mise à jour subscription_status = 'active'
3. Ou invoice.payment_failed → 'past_due'
4. Ou customer.subscription.deleted → 'canceled'
5. User peut gérer via /api/stripe/portal
```

## Modèle de Données

### Users
```sql
id: INTEGER PRIMARY KEY
email: TEXT UNIQUE
name: TEXT
stripe_customer_id: TEXT
subscription_status: TEXT (inactive|trialing|active|past_due|canceled)
subscription_id: TEXT
trial_end_date: DATETIME
created_at: DATETIME
```

### Business Plans
```sql
id: INTEGER PRIMARY KEY
user_id: INTEGER FK
title: TEXT
content: TEXT (JSON)
business_name: TEXT
industry: TEXT
created_at: DATETIME
```

### Sessions
```sql
id: TEXT PRIMARY KEY (UUID)
user_id: INTEGER FK
expires_at: DATETIME
```

## Sécurité

- **Auth**: JWT signés avec HS256, expiration 7 jours
- **Sessions**: Cookies HttpOnly, SameSite=Lax
- **Stripe**: Webhook signature vérifiée
- **CORS**: Origine * (à restreindre en prod)
- **SQL**: Requêtes paramétrées (pas d'injection)

## Performance

- Cloudflare Edge: <50ms latency worldwide
- D1: Requêtes SQL rapides (index sur email, user_id)
- Cache: Pas de cache pour l'instant (API dynamique)
- AI: Appels async, timeout ~30s

## Scaling

Le stack Cloudflare Workers + D1 scale automatiquement:
- Workers: 100k+ req/jour gratuit
- D1: 500k requêtes/jour gratuit
- Au-delà: tarification Cloudflare standard
