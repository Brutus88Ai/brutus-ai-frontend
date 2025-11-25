#!/bin/bash

# Brutus AI - Komplettes Deployment auf eigenem Server

echo "🚀 Brutus AI Deployment startet..."

SERVER_IP="72.62.40.139"
SERVER_USER="root"
APP_DIR="/var/www/brutus-ai"

echo "📦 Schritt 1: Build erstellen..."
npm run build

echo "📤 Schritt 2: Setup-Script zum Server kopieren..."
scp setup-server.sh ${SERVER_USER}@${SERVER_IP}:/root/

echo "🔧 Schritt 3: Server einrichten..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /root
chmod +x setup-server.sh
./setup-server.sh
ENDSSH

echo "📤 Schritt 4: Code zum Server kopieren..."
# Frontend
rsync -avz --exclude 'node_modules' --exclude '.git' \
  dist/ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/dist/

rsync -avz --exclude 'node_modules' \
  ecosystem.config.js package.json \
  ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

# Backend
rsync -avz --exclude 'node_modules' \
  server/ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/server/

echo "🔧 Schritt 5: Dependencies installieren und starten..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /var/www/brutus-ai

# Serve installieren (für statische Files)
npm install -g serve

# Backend Dependencies
cd server
npm install
cd ..

# PM2 starten
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save

# Status anzeigen
pm2 status

echo "✅ Deployment abgeschlossen!"
echo ""
echo "🌐 Deine App läuft jetzt auf:"
echo "   https://brutus-ai.de"
echo ""
echo "📊 PM2 Status: pm2 status"
echo "📝 Logs anzeigen: pm2 logs brutus-ai-frontend"
echo "🔄 Neustart: pm2 restart all"
echo ""
echo "📧 Support: brutusaiswebapp@gmail.com"
ENDSSH

echo "🎉 Alles fertig! App ist online!"
