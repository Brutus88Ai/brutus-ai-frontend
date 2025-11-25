# Brutus AI - Server Deployment Anleitung

## Setup auf dem Hostinger VPS

### 1. Skript auf Server kopieren

```bash
# Lokal (in PowerShell):
scp server-setup.sh root@72.62.40.139:/root/

# Auf Server (SSH):
ssh root@72.62.40.139
cd /root
chmod +x server-setup.sh
```

### 2. Skript ausführen

```bash
bash server-setup.sh
```

Das Skript führt automatisch aus:
- ✓ Stoppt Docker-Container (Traefik)
- ✓ Räumt alte Nginx-Prozesse auf
- ✓ Startet Nginx neu
- ✓ Prüft DNS-Einträge
- ✓ Installiert SSL-Zertifikat via Certbot
- ✓ Erstellt Update-Skript

### 3. DNS-Einträge (falls noch nicht erledigt)

Im Hostinger DNS-Panel:
1. **LÖSCHEN**: CNAME `www` → `brutus88ai.github.io`
2. **BEHALTEN**: A-Record `@` → `72.62.40.139`
3. **NEU ANLEGEN**: A-Record `www` → `72.62.40.139`

Warten bis DNS propagiert (1-5 Minuten), dann prüfen:
```bash
dig +short www.brutus-ai.de A
# Sollte zeigen: 72.62.40.139
```

### 4. Nach dem Setup

**Seite testen:**
```
https://brutus-ai.de
https://www.brutus-ai.de
```

**Updates deployen:**
```bash
ssh root@72.62.40.139
bash /opt/brutus-ai/src/update.sh
```

**Logs prüfen:**
```bash
# Nginx Status
systemctl status nginx

# Nginx Logs
tail -f /var/log/nginx/error.log

# Certbot Logs
tail -f /var/log/letsencrypt/letsencrypt.log
```

## Manuelle Schritte (falls Skript fehlschlägt)

### Port 80 freigeben
```bash
# Container finden und stoppen
docker ps
docker stop root-traefik-1
docker rm root-traefik-1

# Docker deaktivieren (falls nicht benötigt)
systemctl disable --now docker

# Port prüfen
ss -tulpn | grep :80
```

### Nginx neu starten
```bash
systemctl stop nginx
pkill -f nginx
rm -f /run/nginx.pid
nginx -t
systemctl start nginx
systemctl status nginx
```

### Certbot manuell
```bash
certbot --nginx -d brutus-ai.de -d www.brutus-ai.de
# E-Mail: brutusaiswebapp@gmail.com
# Redirect: Yes
```

## Troubleshooting

### "Address already in use"
→ Docker-Container läuft noch: `docker ps` und `docker stop <name>`

### "DNS resolution failed"
→ DNS noch nicht propagiert, 5-10 Minuten warten

### Nginx startet nicht
→ Konfiguration prüfen: `nginx -t`
→ Port belegt: `ss -tulpn | grep :80`

### SSL-Zertifikat nicht erreichbar
→ Firewall prüfen: `ufw status`
→ Port 443 öffnen: `ufw allow 443/tcp`
