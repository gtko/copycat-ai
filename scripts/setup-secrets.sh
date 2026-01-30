#!/bin/bash
#
# Setup script for Copycat AI secrets
# Usage: ./scripts/setup-secrets.sh [--local|--production]
#

set -e

ENV="${1:---local}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Copycat AI - Configuration des Secrets${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        print_error "wrangler CLI n'est pas installé"
        echo ""
        echo "Installez-le avec :"
        echo "  npm install -g wrangler"
        exit 1
    fi
    print_success "wrangler CLI est installé"
}

get_secret() {
    local name=$1
    local description=$2
    local example=$3
    
    echo ""
    print_step "Configuration de ${YELLOW}${name}${NC}"
    print_info "${description}"
    if [ -n "$example" ]; then
        print_info "Exemple: ${example}"
    fi
    echo ""
    
    if [ "$ENV" == "--production" ]; then
        wrangler secret put "$name"
    else
        wrangler secret put "$name" --local
    fi
    
    print_success "${name} configuré"
}

verify_secrets() {
    echo ""
    print_step "Vérification des secrets configurés..."
    
    if [ "$ENV" == "--production" ]; then
        wrangler secret list
    else
        # Pour local, on vérifie juste le fichier .dev.vars
        if [ -f "$SCRIPT_DIR/../.dev.vars" ]; then
            print_success "Fichier .dev.vars trouvé"
            echo ""
            print_info "Secrets locaux configurés :"
            grep -E "^[A-Z_]+=" "$SCRIPT_DIR/../.dev.vars" | cut -d'=' -f1 | while read -r secret; do
                echo "  • $secret"
            done
        fi
    fi
}

show_next_steps() {
    echo ""
    echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Configuration terminée !${NC}"
    echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Prochaines étapes :"
    echo ""
    
    if [ "$ENV" == "--local" ]; then
        echo "  1. Créer la base de données D1 :"
        echo -e "     ${YELLOW}npm run db:create${NC}"
        echo ""
        echo "  2. Appliquer le schéma :"
        echo -e "     ${YELLOW}wrangler d1 execute copycat-ai-db --file=./src/db/schema.sql --local${NC}"
        echo ""
        echo "  3. Lancer le serveur de développement :"
        echo -e "     ${YELLOW}npm run dev${NC}"
        echo ""
        echo "  4. Ouvrir http://localhost:8787"
    else
        echo "  1. Configurer les autres variables dans wrangler.toml :"
        echo -e "     ${YELLOW}- STRIPE_PUBLISHABLE_KEY${NC}"
        echo -e "     ${YELLOW}- POSTHOG_KEY${NC}"
        echo -e "     ${YELLOW}- BETTERSTACK_TOKEN${NC}"
        echo ""
        echo "  2. Déployer :"
        echo -e "     ${YELLOW}npm run deploy${NC}"
    fi
    echo ""
}

main() {
    print_header
    
    # Check arguments
    if [ "$ENV" != "--local" ] && [ "$ENV" != "--production" ]; then
        echo "Usage: ./scripts/setup-secrets.sh [--local|--production]"
        echo ""
        echo "Options:"
        echo "  --local       Configurer pour le développement local (défaut)"
        echo "  --production  Configurer pour la production"
        exit 1
    fi
    
    if [ "$ENV" == "--local" ]; then
        print_info "Mode: Développement local"
    else
        print_info "Mode: Production"
    fi
    
    check_wrangler
    
    # Configuration des secrets
    echo ""
    echo -e "${YELLOW}Configuration des 4 secrets requis :${NC}"
    
    get_secret "STRIPE_SECRET_KEY" \
        "Clé secrète Stripe (commence par sk_...)" \
        "sk_test_xxx ou sk_live_xxx"
    
    get_secret "STRIPE_WEBHOOK_SECRET" \
        "Secret du webhook Stripe (pour recevoir les événements)" \
        "whsec_xxx"
    
    get_secret "JWT_SECRET" \
        "Secret pour signer les tokens JWT (générez une chaîne aléatoire)" \
        "$(openssl rand -base64 32 2>/dev/null || echo 'votre-secret-aléatoire-64-caractères')"
    
    get_secret "KIMI_API_KEY" \
        "Clé API pour Kimi (ou OpenAI si vous utilisez OpenAI)" \
        "kimi-xxx ou sk-xxx"
    
    # Vérification
    verify_secrets
    
    # Afficher les prochaines étapes
    show_next_steps
}

main "$@"
