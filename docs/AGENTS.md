# 🤖 Agents Tracking - Copycat AI

## Agents Actifs / Récents

| Label | Session Key | Status | Mission | Résultat |
|-------|-------------|--------|---------|----------|
| 🏗️ **DEV-Setup** | `agent:main:subagent:caa88f09-ce10-42aa-96b2-bd10ebe91fa8` | ✅ Terminé | Script setup + docs | scripts/setup.sh, SETUP.md |
| 🔍 **QA-Security** | `agent:main:subagent:ff14a617-b976-4645-89a7-4dfbffad1258` | ✅ Terminé | Audit sécurité | 10 issues P0-P2 créées |
| 🔍 **QA-Code** | `agent:main:subagent:c1dba5e5-9222-42b5-848b-eb248bc22ad2` | ✅ Terminé | Audit code quality | 6 issues bugs/quality |
| 💀 **DEV-Initial** | `agent:main:subagent:ce47536e-d726-43e7-a38d-ec9ae49fe39d` | ⏹️ ABANDONNÉ | Première passe | Timeout, remplacé par DEV-Setup |

## Convention de Nommage pour Futures Sessions

Pour lancer un nouvel agent avec un label clair :

```bash
# Format: [ROLE]-[MISSION]-[NUMERO]
# Exemples:
- DEV-Stripe-01     # Dev sur issue Stripe #3
- DEV-BugFix-01     # Correction bugs P0
- QA-Test-01        # Tests fonctionnels
- DOC-Write-01      # Documentation
```

## Commandes Utiles

```bash
# Lister les sessions
sessions_list

# Voir l'historique d'un agent
sessions_history sessionKey="agent:main:subagent:XXXX"

# Tuer une session
sessions_send sessionKey="agent:main:subagent:XXXX" message="/exit"
```

## Issues Créées par les Agents

### QA-Security (10 issues)
- #9 XSS vulnerability (P0)
- #10 CORS too permissive (P0)
- #11 Missing rate limiting (P0)
- #12 Insecure session cookies (P1)
- #13 Duplicate cookie parsing (P1)
- #14 Trial time display bug (P2)
- #16 Missing input validation (P1)
- #17 No login page (P2)
- #18 AI blocks UX (P2)
- #19 No automated tests (P2)

### QA-Code (6 issues)
- #20 TypeScript errors in tests
- #21 JSON.parse without try-catch
- #22 PostHog wrong variable
- #23 Weak email validation
- #24 Type any in checkAuth
- #25 Missing auth rate limiting

## Prochaines Sessions Prévues

- [ ] **DEV-BugFix-P0** : Corriger les 4 bugs P0 (XSS, CORS, rate limit, cookies)
- [ ] **DEV-Stripe** : Finaliser setup Stripe produits
- [ ] **DEV-Tests** : Implémenter tests basiques
- [ ] **DEV-PostHog** : Fix analytics tracking

---
Dernière mise à jour: 2026-01-30
