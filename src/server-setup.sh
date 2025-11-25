#!/bin/bash
# Brutus AI - Automatisches Server-Setup-Skript
# Führe dieses Skript auf dem VPS als root aus

set -e  # Bei Fehler abbrechen

echo "=== Brutus AI Server Setup ==="
echo ""

# 1. Docker-Container stoppen und Docker deaktivieren
echo "→ Stoppe Docker-Container und deaktiviere Docker..."
if docker ps -q --filter "name=root-traefik-1" | grep -q .; then
    docker stop root-traefik-1 || true
    docker rm root-traefik-1 || true
fi
systemctl disable --now docker || true

# 2. Alte Nginx-Prozesse aufräumen
echo "→ Räume alte Nginx-Prozesse auf..."
systemctl stop nginx || true
pkill -f nginx || true
rm -f /run/nginx.pid || true

# 3. Port 80 prüfen
echo "→ Prüfe Port 80..."
if ss -tulpn | grep -q ':80 '; then
    echo "WARNUNG: Port 80 ist noch belegt!"
    ss -tulpn | grep ':80'
    read -p "Trotzdem fortfahren? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 4. Nginx-Konfiguration testen und starten
echo "→ Teste Nginx-Konfiguration..."
nginx -t

echo "→ Starte Nginx..."
systemctl start nginx
systemctl enable nginx

echo "→ Nginx-Status:"
systemctl status nginx --no-pager

# 5. DNS-Check
echo ""
echo "→ Prüfe DNS-Einträge..."
echo "brutus-ai.de:"
dig +short brutus-ai.de A
echo "www.brutus-ai.de:"
dig +short www.brutus-ai.de A

read -p "Sind die DNS-Einträge korrekt auf 72.62.40.139? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Bitte erst die DNS-Einträge korrigieren:"
    echo "1. CNAME 'www → brutus88ai.github.io' löschen"
    echo "2. A-Record 'www → 72.62.40.139' anlegen"
    echo "3. Warten bis dig die neue IP zeigt"
    echo "Dann dieses Skript erneut ausführen."
    exit 1
fi

# 6. Certbot ausführen
echo ""
echo "→ Richte SSL-Zertifikat ein..."
certbot --nginx -d brutus-ai.de -d www.brutus-ai.de --non-interactive --agree-tos --email pascalhares@gmail.com --redirect

# 7. Update-Skript erstellen
echo ""
echo "→ Erstelle Update-Skript..."
cat > /opt/brutus-ai/src/update.sh << 'EOF'
#!/bin/bash
# Brutus AI - Update-Skript
set -e

cd /opt/brutus-ai/src

echo "=== Brutus AI Update ==="
echo "→ Git Pull..."
git pull origin main

echo "→ Install Dependencies..."
npm install

echo "→ Build..."
npm run build

echo "→ Nginx Reload..."
systemctl reload nginx

echo "✓ Update abgeschlossen!"
echo "Seite: https://brutus-ai.de"
EOF

chmod +x /opt/brutus-ai/src/update.sh

# 8. Finaler Test
echo ""
echo "=== Setup abgeschlossen! ==="
echo ""
echo "✓ Nginx läuft"
echo "✓ SSL-Zertifikat installiert"
echo "✓ Update-Skript erstellt: /opt/brutus-ai/src/update.sh"
echo ""
echo "Teste jetzt: https://brutus-ai.de"
echo ""
echo "Für Updates in Zukunft:"
echo "  bash /opt/brutus-ai/src/update.sh"
