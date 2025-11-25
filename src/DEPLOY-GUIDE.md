# 🚀 Brutus AI - Quick Deployment Guide

## Prerequisites

- Node.js 18+ installiert
- Git installiert
- Vercel Account (https://vercel.com)

## 📦 Lokaler Build Test

```bash
# Dependencies installieren
npm install

# Build testen
npm run build

# Lokal testen
npm run dev
# Öffne: http://localhost:5173
```

## 🌐 Vercel Deployment (Empfohlen)

### Option 1: Vercel CLI (Schnell)

```bash
# Vercel CLI installieren
npm i -g vercel

# Login
vercel login

# Deploy (Preview)
vercel

# Deploy (Production)
vercel --prod
```

### Option 2: Vercel Dashboard (Einfach)

1. **GitHub Repo erstellen**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Brutus AI Frontend"
   git branch -M main
   git remote add origin https://github.com/Brutus88Ai/brutus-ai-frontend.git
   git push -u origin main
   ```

2. **Vercel Dashboard**
   - Gehe zu https://vercel.com/new
   - Wähle dein GitHub Repo
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Klick "Deploy"

3. **Domain konfigurieren**
   - Project Settings → Domains
   - Füge `brutus-ai.de` hinzu
   - Folge DNS-Anweisungen

### Vercel Konfiguration

Die `vercel.json` ist bereits konfiguriert:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [...]  // Security Headers
}
```

## 🔒 Environment Variables (Optional)

Für Production mit Backend-API:

```bash
# In Vercel Dashboard: Project Settings → Environment Variables

VITE_GEMINI_API_KEY=AIzaSyAkjhVi57D95fNTT6PdLGKhE0S2eOZU7w0
VITE_API_ENDPOINT=https://api.brutus-ai.de
VITE_SUPPORT_EMAIL=brutusaiswebapp@gmail.com
```

## 🌍 Custom Domain Setup

### Brutus-AI.de DNS Einstellungen

**Bei deinem Domain-Provider (z.B. Namecheap, GoDaddy):**

```
Type    Name    Value                    TTL
A       @       76.76.21.21             Auto
CNAME   www     cname.vercel-dns.com    Auto
```

### Vercel Domain Verification

1. Project Settings → Domains
2. Add Domain: `brutus-ai.de`
3. Add Domain: `www.brutus-ai.de`
4. Warte auf SSL-Zertifikat (automatisch)

## 📊 Post-Deployment Checks

### 1. Funktionstest
```bash
# Alle Seiten testen
- https://brutus-ai.de/
- https://brutus-ai.de/trends
- https://brutus-ai.de/content
- https://brutus-ai.de/planner
- https://brutus-ai.de/status
- https://brutus-ai.de/billing
- https://brutus-ai.de/settings
```

### 2. Security Headers Check
```bash
curl -I https://brutus-ai.de

# Erwartete Headers:
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

### 3. Performance Check
- Google PageSpeed: https://pagespeed.web.dev
- Lighthouse Audit: Chrome DevTools
- GTmetrix: https://gtmetrix.com

## 🐛 Troubleshooting

### Build Fehler

```bash
# Cache löschen
rm -rf node_modules dist .vite
npm install
npm run build
```

### Routing 404 Fehler

Stelle sicher, dass `vercel.json` rewrites hat:

```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### CORS Fehler

Aktualisiere `lib/security.js`:

```javascript
export const ALLOWED_ORIGINS = [
  'https://brutus-ai.de',
  'https://www.brutus-ai.de',
  // Vercel Preview URLs
  'https://*.vercel.app'
];
```

## 🔄 Updates & Redeploy

```bash
# Code ändern
git add .
git commit -m "Update: Beschreibung"
git push origin main

# Vercel deployed automatisch!
```

## 📧 Support

Bei Problemen:
- **Email**: brutusaiswebapp@gmail.com
- **GitHub Issues**: https://github.com/Brutus88Ai/brutus-ai-frontend/issues

## ✅ Deployment Checklist

- [ ] `npm run build` läuft ohne Fehler
- [ ] Alle Routen funktionieren lokal
- [ ] Support-Email korrekt: brutusaiswebapp@gmail.com
- [ ] vercel.json Security Headers konfiguriert
- [ ] Git Repo erstellt und gepusht
- [ ] Vercel Projekt erstellt
- [ ] Custom Domain hinzugefügt
- [ ] DNS Einstellungen aktualisiert
- [ ] SSL-Zertifikat aktiv
- [ ] Alle Seiten erreichbar
- [ ] Security Headers aktiv
- [ ] Performance-Test bestanden

## 🎉 Go Live!

```bash
vercel --prod
```

**Deine App ist jetzt live unter:**
- https://brutus-ai.de
- https://www.brutus-ai.de

---

**Version**: 1.0.0
**Last Updated**: 25. November 2024
