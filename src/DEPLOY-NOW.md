# 🚀 Sofortiger Deployment-Prozess für brutus-ai.de

## ✅ Status: DEPLOYMENT-READY

**Server:** 72.62.40.139  
**Domain:** brutus-ai.de  
**Build:** Erfolgreich (348.74 KB JS, 16.03 KB CSS)

---

## 🎯 DEPLOYMENT IN 3 SCHRITTEN

### SCHRITT 1: Server Setup (5-10 Minuten)

1. **Verbinde dich mit dem Server:**
```bash
ssh root@72.62.40.139
```

2. **Lade das Setup-Script hoch:**
```bash
# Auf deinem lokalen PC (in PowerShell):
scp setup-server.sh root@72.62.40.139:/root/
```

3. **Führe das Setup aus:**
```bash
# Auf dem Server:
chmod +x /root/setup-server.sh
/root/setup-server.sh
```

Das Script installiert automatisch:
- ✅ Node.js 20
- ✅ Nginx (Reverse Proxy)
- ✅ PM2 (Process Manager)
- ✅ SSL Zertifikat (Let's Encrypt)
- ✅ Firewall (UFW)

---

### SCHRITT 2: Code Deployment (2-3 Minuten)

**Option A: Automatisches Deployment (empfohlen)**
```bash
# Auf deinem lokalen PC:
bash deploy.sh
```

**Option B: Manuelles Deployment**
```bash
# 1. Verbinde dich mit dem Server
ssh root@72.62.40.139

# 2. Erstelle Projekt-Verzeichnis
mkdir -p /var/www/brutus-ai
cd /var/www/brutus-ai

# 3. Clone dein Git Repository (ODER upload die Dateien)
# Wenn du Git verwendest:
git clone https://github.com/DEIN_USERNAME/brutus-ai.git .

# Wenn du die Dateien direkt hochladen willst:
# Auf deinem lokalen PC:
scp -r c:/Users/pasca/Desktop/Brutus\ Ai\ code/src/* root@72.62.40.139:/var/www/brutus-ai/

# 4. Installiere Dependencies
cd /var/www/brutus-ai
npm install

# 5. Baue die App (falls nicht schon geschehen)
npm run build

# 6. Starte mit PM2
pm2 start ecosystem.config.js
pm2 save
```

---

### SCHRITT 3: DNS Konfiguration (5-30 Minuten Propagation)

Gehe zu deinem Domain-Provider und füge hinzu:

| Typ | Name | Wert | TTL |
|-----|------|------|-----|
| A | @ | 72.62.40.139 | 3600 |
| A | www | 72.62.40.139 | 3600 |

**Warte 5-30 Minuten** auf DNS-Propagation.

---

## 🔍 DEPLOYMENT VERIFIZIERUNG

### 1. Server Status prüfen
```bash
ssh root@72.62.40.139
pm2 status
pm2 logs
```

### 2. Nginx Status
```bash
systemctl status nginx
```

### 3. SSL Zertifikat prüfen
```bash
certbot certificates
```

### 4. Website testen
- Frontend: https://brutus-ai.de
- Alternative: http://72.62.40.139 (vor DNS-Propagation)

---

## 🎯 BACKEND DEPLOYMENT (OPTIONAL)

### Backend Server starten

1. **Backend-Dateien hochladen:**
```bash
scp -r server/ root@72.62.40.139:/var/www/brutus-ai/
```

2. **Auf dem Server:**
```bash
cd /var/www/brutus-ai/server
npm install

# Starte Backend mit PM2
pm2 start index.js --name brutus-backend
pm2 save
```

3. **Nginx für Backend konfigurieren:**
```bash
nano /etc/nginx/sites-available/brutus-ai.de
```

Füge hinzu nach der Frontend-Location:
```nginx
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```

4. **Nginx neu laden:**
```bash
nginx -t
systemctl reload nginx
```

---

## 📊 NACH DEM DEPLOYMENT

### PM2 Monitoring
```bash
pm2 monit          # Echtzeit-Monitoring
pm2 list           # Alle Prozesse anzeigen
pm2 logs brutus-ai # Logs anzeigen
```

### Updates deployen
```bash
# Auf deinem lokalen PC:
bash deploy.sh
```

### Logs prüfen
```bash
ssh root@72.62.40.139
pm2 logs brutus-ai --lines 100
```

### PM2 Befehle
```bash
pm2 restart brutus-ai  # App neu starten
pm2 stop brutus-ai     # App stoppen
pm2 delete brutus-ai   # App entfernen
pm2 save               # Konfiguration speichern
```

---

## ⚠️ TROUBLESHOOTING

### Problem: Nginx startet nicht
```bash
nginx -t  # Konfiguration testen
systemctl status nginx
journalctl -xe  # Error logs
```

### Problem: PM2 App crashed
```bash
pm2 logs brutus-ai --err  # Error logs anzeigen
pm2 restart brutus-ai     # Neu starten
```

### Problem: SSL Zertifikat fehlt
```bash
# Manuell erstellen:
certbot --nginx -d brutus-ai.de -d www.brutus-ai.de
```

### Problem: Port 80/443 blockiert
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

### Problem: Website nicht erreichbar
1. DNS propagiert noch? → Warte 30 Minuten
2. Firewall blockiert? → `ufw status`
3. Nginx läuft? → `systemctl status nginx`
4. PM2 läuft? → `pm2 status`

---

## 🔐 SICHERHEITS-CHECKLIST

- [x] SSL/HTTPS aktiviert
- [x] Firewall (UFW) konfiguriert
- [x] Security Headers in Nginx
- [x] PM2 Auto-Restart aktiviert
- [x] API Rate Limiting implementiert
- [x] XSS Protection aktiv
- [x] CORS konfiguriert

---

## 📞 SUPPORT

Bei Problemen:
- **Email:** brutusaiswebapp@gmail.com
- **Server IP:** 72.62.40.139
- **Domain:** brutus-ai.de

---

## 🚀 QUICK START (Kompletter Prozess)

```bash
# 1. Setup-Script hochladen und ausführen
scp setup-server.sh root@72.62.40.139:/root/
ssh root@72.62.40.139 "chmod +x /root/setup-server.sh && /root/setup-server.sh"

# 2. Code deployen
bash deploy.sh

# 3. DNS konfigurieren (im Browser bei deinem Domain-Provider)

# 4. Warten auf DNS-Propagation (5-30 min)

# 5. Website aufrufen: https://brutus-ai.de
```

---

**Status:** ✅ BEREIT ZUM DEPLOYMENT  
**Letzte Aktualisierung:** $(Get-Date -Format "yyyy-MM-dd HH:mm")  
**Build-Größe:** 348.74 KB (gzipped: 108.48 KB)
