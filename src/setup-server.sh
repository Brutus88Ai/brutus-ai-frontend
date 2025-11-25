#!/bin/bash

# Brutus AI - Komplette Server-Installation
# Für Ubuntu 22.04 LTS

set -e

echo "🚀 Brutus AI Server Setup gestartet..."

# System Update
echo "📦 System wird aktualisiert..."
apt-get update
apt-get upgrade -y

# Node.js 20 installieren
echo "📦 Node.js 20 wird installiert..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PM2 installieren (Process Manager)
echo "📦 PM2 wird installiert..."
npm install -g pm2

# Nginx installieren
echo "📦 Nginx wird installiert..."
apt-get install -y nginx

# Certbot installieren (SSL)
echo "📦 Certbot wird installiert..."
apt-get install -y certbot python3-certbot-nginx

# Firewall konfigurieren
echo "🔥 Firewall wird konfiguriert..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# App Verzeichnis erstellen
echo "📁 App-Verzeichnis wird erstellt..."
mkdir -p /var/www/brutus-ai
cd /var/www/brutus-ai

# Nginx Konfiguration
echo "⚙️ Nginx wird konfiguriert..."
cat > /etc/nginx/sites-available/brutus-ai << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name brutus-ai.de www.brutus-ai.de;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # CSP Header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com https://www.googleapis.com https://api.openai.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

    root /var/www/brutus-ai/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache statische Assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Proxy (optional für Backend)
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;
    }
}
EOF

# Nginx aktivieren
ln -sf /etc/nginx/sites-available/brutus-ai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx testen und neustarten
nginx -t
systemctl restart nginx

# SSL Zertifikat automatisch erstellen
echo "🔒 SSL-Zertifikat wird erstellt..."
certbot --nginx -d brutus-ai.de -d www.brutus-ai.de --non-interactive --agree-tos --email brutusaiswebapp@gmail.com --redirect

# Auto-Renewal einrichten
systemctl enable certbot.timer
systemctl start certbot.timer

# PM2 Startup konfigurieren
pm2 startup systemd -u root --hp /root

echo "✅ Server-Installation abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Code nach /var/www/brutus-ai kopieren"
echo "2. npm install && npm run build"
echo "3. pm2 start ecosystem.config.js"
echo "4. pm2 save"
echo ""
echo "🌐 Deine App ist erreichbar unter:"
echo "   https://brutus-ai.de"
echo ""
echo "📧 Support: brutusaiswebapp@gmail.com"
