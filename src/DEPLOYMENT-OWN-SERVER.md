# 🚀 Brutus AI - Eigener Server Deployment

## Automatisches Setup (EMPFOHLEN)

### 1. Build erstellen
```bash
cd "C:\Users\pasca\Desktop\Brutus Ai code\src"
npm run build
```

### 2. SSH-Zugang prüfen
```bash
ssh root@72.62.40.139
# Wenn funktioniert, mit exit verlassen
```

### 3. Deploy-Script ausführen
```bash
bash deploy.sh
```

Das war's! Die App ist automatisch online unter https://brutus-ai.de

---

## Manuelle Installation (falls automatisch nicht klappt)

### Schritt 1: Setup-Script auf Server kopieren
```bash
scp setup-server.sh root@72.62.40.139:/root/
```

### Schritt 2: Auf Server einloggen
```bash
ssh root@72.62.40.139
```

### Schritt 3: Setup ausführen
```bash
cd /root
chmod +x setup-server.sh
./setup-server.sh
```

### Schritt 4: Code kopieren (lokal ausführen)
```bash
# Build erstellen
npm run build

# Zum Server kopieren
scp -r dist/* root@72.62.40.139:/var/www/brutus-ai/dist/
scp ecosystem.config.js package.json root@72.62.40.139:/var/www/brutus-ai/
scp -r server root@72.62.40.139:/var/www/brutus-ai/
```

### Schritt 5: Backend installieren (auf Server)
```bash
ssh root@72.62.40.139

cd /var/www/brutus-ai/server
npm install

cd /var/www/brutus-ai
npm install -g serve
```

### Schritt 6: PM2 starten (auf Server)
```bash
cd /var/www/brutus-ai
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

---

## Nach dem Deployment

### App testen
```
https://brutus-ai.de
```

### PM2 Befehle
```bash
# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs brutus-ai-frontend
pm2 logs brutus-ai-backend

# Neustart
pm2 restart all

# Stop
pm2 stop all

# Löschen
pm2 delete all
```

### Nginx Befehle
```bash
# Status prüfen
systemctl status nginx

# Neustart
systemctl restart nginx

# Logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### SSL-Zertifikat erneuern
```bash
certbot renew --dry-run  # Test
certbot renew            # Erneuern
```

---

## Struktur auf dem Server

```
/var/www/brutus-ai/
├── dist/                    # Frontend Build
│   ├── index.html
│   ├── assets/
│   └── ...
├── server/                  # Backend
│   ├── index.js
│   └── package.json
├── ecosystem.config.js      # PM2 Config
└── package.json
```

---

## DNS Einstellungen

Bei deinem Domain-Provider (z.B. Namecheap):

```
Type    Name    Value           TTL
A       @       72.62.40.139    Auto
CNAME   www     @               Auto
```

---

## Firewall Status

```bash
# Firewall prüfen
ufw status

# Sollte zeigen:
# 22/tcp  ALLOW  # SSH
# 80/tcp  ALLOW  # HTTP
# 443/tcp ALLOW  # HTTPS
```

---

## Troubleshooting

### App lädt nicht
```bash
# Nginx Status
systemctl status nginx

# PM2 Status
pm2 status

# Logs prüfen
pm2 logs
```

### SSL-Fehler
```bash
# Zertifikat neu erstellen
certbot --nginx -d brutus-ai.de -d www.brutus-ai.de --force-renewal
```

### Backend antwortet nicht
```bash
# Backend-Logs
pm2 logs brutus-ai-backend

# Backend neustarten
pm2 restart brutus-ai-backend
```

### Zu wenig Speicher
```bash
# Speicher prüfen
free -h

# PM2 Memory Limit erhöhen (ecosystem.config.js)
max_memory_restart: '1G'
```

---

## Updates deployen

```bash
# Lokal: Neuen Build erstellen
npm run build

# Code zum Server kopieren
scp -r dist/* root@72.62.40.139:/var/www/brutus-ai/dist/

# Auf Server: PM2 neustarten
ssh root@72.62.40.139 "pm2 restart all"
```

---

## Backup erstellen

```bash
# Auf Server
ssh root@72.62.40.139

# Backup erstellen
cd /var/www
tar -czf brutus-ai-backup-$(date +%Y%m%d).tar.gz brutus-ai/

# Lokal herunterladen
scp root@72.62.40.139:/var/www/brutus-ai-backup-*.tar.gz ./backups/
```

---

## Monitoring

### Server-Ressourcen
```bash
# CPU & Memory
htop

# Disk Space
df -h

# PM2 Monitoring
pm2 monit
```

### Uptime Monitoring
- UptimeRobot: https://uptimerobot.com (kostenlos)
- Überwacht: https://brutus-ai.de
- Benachrichtigung bei Downtime

---

## Support

**Email**: brutusaiswebapp@gmail.com

**Server-IP**: 72.62.40.139
**Domain**: brutus-ai.de

---

## Security Checklist

- [x] Firewall aktiviert (ufw)
- [x] SSL/HTTPS (Let's Encrypt)
- [x] Security Headers (Nginx)
- [x] Rate Limiting (Express)
- [x] CSP Headers
- [x] HSTS aktiviert
- [x] Auto-Renewal SSL (Certbot)

---

## Performance

- **Frontend**: Nginx + Gzip
- **Backend**: PM2 Cluster (2 Instanzen)
- **SSL**: Let's Encrypt
- **CDN**: Optional (Cloudflare)

**Ladezeit**: < 2s (geschätzt)
**Uptime**: 99.9% (Ziel)

---

🎉 **Fertig! Deine App läuft auf deinem eigenen Server!**
