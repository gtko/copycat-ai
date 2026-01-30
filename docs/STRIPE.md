# 💳 Stripe Setup Guide

Ce guide explique comment configurer Stripe pour Copycat AI.

## 🎯 Funnel de Paiement

Copycat AI utilise un **funnel agressif** avec trial payant :

1. **Trial de 48h** : 2,90€ (déduit de la première facture)
2. **Abonnement** : 49,90€ tous les 28 jours
3. **Annulation** : Possible à tout moment via le Portail Client Stripe

## 🚀 Configuration Automatisée

### Prérequis

```bash
# Avoir configuré les secrets Stripe
wrangler secret put STRIPE_SECRET_KEY
```

### Setup Local

```bash
# 1. Exporter votre clé Stripe test
export STRIPE_SECRET_KEY=sk_test_...

# 2. Lancer le script de setup
npm run setup:stripe

# 3. Sauvegarder le webhook secret affiché
wrangler secret put STRIPE_WEBHOOK_SECRET
```

### Setup Production

```bash
# 1. Exporter votre clé Stripe live
export STRIPE_SECRET_KEY=sk_live_...
export APP_URL=https://votre-domaine.com

# 2. Lancer le script de setup
npm run setup:stripe:prod

# 3. Sauvegarder le webhook secret
wrangler secret put STRIPE_WEBHOOK_SECRET
```

## 📝 Configuration Manuelle (Alternative)

Si vous préférez configurer manuellement dans le Dashboard Stripe :

### 1. Créer le Produit

- **Nom** : Copycat AI - Essai 48h
- **Description** : Accès complet à Copycat AI pendant 48 heures, puis abonnement de 49,90€ tous les 28 jours.

### 2. Créer le Prix

- **Modèle de tarification** : Standard
- **Prix** : 49,90€
- **Facturation** : Tous les 28 jours
- **Devise** : EUR

### 3. Configurer le Webhook

- **URL** : `https://votre-domaine.com/api/stripe/webhook`
- **Événements à écouter** :
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## 🧪 Test Local avec Stripe CLI

Pour tester les webhooks en local :

```bash
# 1. Installer Stripe CLI
# https://stripe.com/docs/stripe-cli

# 2. Se connecter
stripe login

# 3. Forwarder les webhooks
stripe listen --forward-to localhost:8787/api/stripe/webhook

# 4. Copier le webhook secret affiché (whsec_...)
wrangler secret put STRIPE_WEBHOOK_SECRET --local
```

## 🔄 Cycle de Vie d'un Abonnement

```
Checkout (2,90€)
    ↓
Trial 48h (active)
    ↓
Première facture (49,90€ - 2,90€ = 47,00€)
    ↓
Renouvellement tous les 28 jours (49,90€)
    ↓
Annulation (via Portal) → accès jusqu'à fin de période
```

## 📊 Événements Webhook Gérés

| Événement | Action |
|-----------|--------|
| `checkout.session.completed` | Active le trial (48h) |
| `invoice.paid` | Passe en statut `active` |
| `invoice.payment_failed` | Passe en statut `past_due` |
| `customer.subscription.deleted` | Passe en statut `canceled` |

## 🛠️ Commandes Utiles

```bash
# Voir la configuration
npm run stripe:config

# Créer un customer de test
npm run stripe:create-customer -- email@example.com

# Lister les subscriptions
npm run stripe:list-subscriptions
```

## 🚨 Dépannage

### "No signatures found matching the expected signature for payload"

Le secret webhook est incorrect. Vérifiez :
```bash
wrangler secret list  # Voir les secrets configurés
```

### Les webhooks ne sont pas reçus en local

Utilisez Stripe CLI :
```bash
stripe listen --forward-to localhost:8787/api/stripe/webhook
```

### "Product not found" lors du checkout

Le produit/prix n'existe pas ou l'ID est incorrect. Relancez le script :
```bash
npm run setup:stripe
```

## 📚 Ressources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
