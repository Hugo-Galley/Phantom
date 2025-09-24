#!/bin/bash

# Script de génération de certificats SSL pour Phantom App
# Compatible avec Raspberry Pi et autres environnements

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration par défaut
SSL_DIR="ssl"
CERT_FILE="cert.pem"
KEY_FILE="key.pem"
DAYS=365
COUNTRY="FR"
STATE="France"
CITY="Local"
ORG="Phantom"
ORG_UNIT="Dev"

# Fonction d'aide
show_help() {
    echo -e "${BLUE}Usage: $0 [OPTIONS]${NC}"
    echo ""
    echo -e "${YELLOW}OPTIONS:${NC}"
    echo "  -i, --ip IP_ADDRESS     Adresse IP à inclure dans le certificat"
    echo "  -h, --host HOSTNAME     Nom d'hôte à inclure (défaut: localhost)"
    echo "  -d, --dir DIRECTORY     Répertoire de destination (défaut: ssl/)"
    echo "  -t, --days DAYS         Durée de validité en jours (défaut: 365)"
    echo "  --help                  Afficher cette aide"
    echo ""
    echo -e "${YELLOW}EXEMPLES:${NC}"
    echo "  $0 -i 192.168.1.100                    # Raspberry Pi sur réseau local"
    echo "  $0 -i 10.0.0.50 -h myserver.local      # Serveur avec hostname personnalisé"
    echo "  $0 -i 192.168.1.100 -d ./custom-ssl    # Répertoire personnalisé"
    echo ""
    echo -e "${YELLOW}DÉTECTION AUTOMATIQUE:${NC}"
    echo "  $0 --auto                               # Détecte automatiquement l'IP locale"
}

# Fonction pour détecter l'IP locale automatiquement
get_local_ip() {
    # Tente plusieurs méthodes pour obtenir l'IP locale
    local ip=""
    
    # Méthode 1: ifconfig (macOS/Linux)
    if command -v ifconfig &> /dev/null; then
        ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | sed 's/addr://')
    fi
    
    # Méthode 2: ip (Linux moderne)
    if [[ -z "$ip" ]] && command -v ip &> /dev/null; then
        ip=$(ip route get 8.8.8.8 | grep -oP 'src \K\S+' 2>/dev/null || true)
    fi
    
    # Méthode 3: hostname (Raspberry Pi/Linux)
    if [[ -z "$ip" ]] && command -v hostname &> /dev/null; then
        ip=$(hostname -I | awk '{print $1}' 2>/dev/null || true)
    fi
    
    echo "$ip"
}

# Fonction pour créer le fichier de configuration OpenSSL
create_openssl_config() {
    local config_file="$1"
    local hostname="$2"
    local ip_addresses="$3"
    
    cat > "$config_file" << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C=$COUNTRY
ST=$STATE
L=$CITY
O=$ORG
OU=$ORG_UNIT
CN=$hostname

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = $hostname
IP.1 = 127.0.0.1
EOF

    # Ajouter les adresses IP supplémentaires
    local ip_counter=2
    for ip in $ip_addresses; do
        if [[ "$ip" != "127.0.0.1" ]]; then
            echo "IP.$ip_counter = $ip" >> "$config_file"
            ((ip_counter++))
        fi
    done
}

# Fonction principale de génération
generate_certificate() {
    local hostname="$1"
    local ip_addresses="$2"
    local ssl_dir="$3"
    local days="$4"
    
    echo -e "${BLUE}🔐 Génération des certificats SSL pour Phantom App${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Créer le répertoire SSL s'il n'existe pas
    if [[ ! -d "$ssl_dir" ]]; then
        echo -e "${YELLOW}📁 Création du répertoire $ssl_dir${NC}"
        mkdir -p "$ssl_dir"
    fi
    
    # Fichiers de sortie
    local cert_path="$ssl_dir/$CERT_FILE"
    local key_path="$ssl_dir/$KEY_FILE"
    local config_path="$ssl_dir/openssl.conf"
    
    # Sauvegarder les anciens certificats s'ils existent
    if [[ -f "$cert_path" ]]; then
        echo -e "${YELLOW}🔄 Sauvegarde des anciens certificats${NC}"
        mv "$cert_path" "$cert_path.backup.$(date +%Y%m%d_%H%M%S)"
        mv "$key_path" "$key_path.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Créer le fichier de configuration OpenSSL
    echo -e "${YELLOW}⚙️  Création de la configuration OpenSSL${NC}"
    create_openssl_config "$config_path" "$hostname" "$ip_addresses"
    
    # Générer la clé privée et le certificat
    echo -e "${YELLOW}🔑 Génération de la clé privée et du certificat${NC}"
    openssl req -new -x509 -keyout "$key_path" -out "$cert_path" -days "$days" -nodes -config "$config_path"
    
    # Définir les permissions appropriées
    chmod 600 "$key_path"
    chmod 644 "$cert_path"
    
    # Nettoyer le fichier de configuration temporaire
    rm "$config_path"
    
    echo -e "${GREEN}✅ Certificats générés avec succès !${NC}"
    echo ""
    echo -e "${BLUE}📋 RÉSUMÉ:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "Certificat: ${GREEN}$cert_path${NC}"
    echo -e "Clé privée: ${GREEN}$key_path${NC}"
    echo -e "Validité: ${GREEN}$days jours${NC}"
    echo -e "Nom d'hôte: ${GREEN}$hostname${NC}"
    echo -e "Adresses IP: ${GREEN}127.0.0.1, $ip_addresses${NC}"
    echo ""
    
    # Afficher les détails du certificat
    echo -e "${BLUE}🔍 DÉTAILS DU CERTIFICAT:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    openssl x509 -in "$cert_path" -noout -subject -dates -ext subjectAltName
    echo ""
    
    echo -e "${GREEN}🎉 Votre application Phantom peut maintenant être accédée en HTTPS sur:${NC}"
    echo -e "   • ${BLUE}https://localhost:5173${NC}"
    echo -e "   • ${BLUE}https://$hostname:5173${NC}"
    for ip in $ip_addresses; do
        if [[ "$ip" != "127.0.0.1" ]]; then
            echo -e "   • ${BLUE}https://$ip:5173${NC}"
        fi
    done
    echo ""
    echo -e "${YELLOW}⚠️  Note: Les certificats auto-signés afficheront un avertissement de sécurité.${NC}"
    echo -e "${YELLOW}   Cliquez sur 'Avancé' puis 'Continuer vers...' pour accepter le certificat.${NC}"
}

# Fonction principale
main() {
    local hostname="localhost"
    local ip_addresses=""
    local ssl_dir="$SSL_DIR"
    local days="$DAYS"
    local auto_detect=false
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--ip)
                ip_addresses="$ip_addresses $2"
                shift 2
                ;;
            -h|--host)
                hostname="$2"
                shift 2
                ;;
            -d|--dir)
                ssl_dir="$2"
                shift 2
                ;;
            -t|--days)
                days="$2"
                shift 2
                ;;
            --auto)
                auto_detect=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Option inconnue: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Détection automatique de l'IP si demandée
    if [[ "$auto_detect" == true ]]; then
        local detected_ip=$(get_local_ip)
        if [[ -n "$detected_ip" ]]; then
            ip_addresses="$ip_addresses $detected_ip"
            echo -e "${GREEN}🔍 IP locale détectée automatiquement: $detected_ip${NC}"
        else
            echo -e "${YELLOW}⚠️  Impossible de détecter automatiquement l'IP locale${NC}"
        fi
    fi
    
    # Vérifier qu'au moins une IP a été fournie
    if [[ -z "$ip_addresses" ]]; then
        echo -e "${RED}❌ Erreur: Aucune adresse IP fournie${NC}"
        echo -e "${YELLOW}💡 Utilisez -i pour spécifier une IP ou --auto pour la détection automatique${NC}"
        echo ""
        show_help
        exit 1
    fi
    
    # Vérifier que OpenSSL est installé
    if ! command -v openssl &> /dev/null; then
        echo -e "${RED}❌ Erreur: OpenSSL n'est pas installé${NC}"
        echo -e "${YELLOW}💡 Installation:${NC}"
        echo "   Ubuntu/Debian: sudo apt-get install openssl"
        echo "   CentOS/RHEL:   sudo yum install openssl"
        echo "   macOS:         brew install openssl"
        exit 1
    fi
    
    # Générer les certificats
    generate_certificate "$hostname" "$ip_addresses" "$ssl_dir" "$days"
}

# Exécuter le script principal
main "$@"