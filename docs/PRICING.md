# Pricing - Funnel Aggressif

## Stratégie de Prix

### Trial (Hook)
- **Prix**: 2,90€
- **Durée**: 48 heures
- **Accès**: Toutes les fonctionnalités
- **Objectif**: Baisser la friction d'entrée

### Abonnement (Revenue)
- **Prix**: 49,90€
- **Fréquence**: Tous les 28 jours (pas mensuel)
- **Pourquoi 28 jours**: 13 facturations/an au lieu de 12 (+8% revenue)

## Configuration Stripe

### Produits à Créer

#### 1. Trial Product
```json
{
  "name": "Copycat AI - Essai 48h",
  "description": "Accès complet pendant 48h, puis abonnement mensuel"
}
```

#### 2. Price (Subscription)
```json
{
  "currency": "eur",
  "unit_amount": 290,
  "recurring": {
    "interval": "day",
    "interval_count": 28
  },
  "trial_period_days": 2
}
```

> ⚠️ Le checkout crée un abonnement avec `trial_end` dans 48h et le premier paiement de 2,90€. Puis Stripe facture 49,90€ tous les 28 jours.

### Webhooks à Configurer

Dans Stripe Dashboard → Developers → Webhooks:
```
Endpoint: https://your-domain.com/api/stripe/webhook
Events:
  - checkout.session.completed
  - invoice.paid
  - invoice.payment_failed
  - customer.subscription.deleted
```

## LTV Calculation

### Hypothèses
- Conversion trial → paid: 30%
- Churn mensuel: 15%
- Average lifetime: 6.7 mois (1/0.15)

### LTV
- Trial revenue: 2,90€ × 100% = 2,90€
- Subscription LTV: 49,90€ × 6.7 × 30% = 100,30€
- **LTV total**: ~103€ par utilisateur

### CAC Target
Avec LTV/CAC ratio de 3:1 → CAC max: 34€

## Tests A/B à Faire

1. **Prix trial**: 2,90€ vs 0,99€ vs 4,90€
2. **Durée trial**: 48h vs 7 jours vs 14 jours
3. **Prix subscription**: 49,90€ vs 39,90€ vs 59,90€
4. **Intervalle**: 28 jours vs 30 jours vs mensuel calendaire

## Upsells Futures

1. **Premium**: 99€/mois pour plans illimités + support
2. **Formation LLC**: 199€ one-time
3. **Consulting**: 500€ pour review par expert
