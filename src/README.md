# Brutus AI front-end

This folder contains the Vite + React front-end for Brutus AI. To run locally:

```powershell
cd "C:\Users\pasca\Desktop\Brutus Ai code\src"
npm install
npm run dev
```

To build for production:

```powershell
npm run build
```

Vercel: Connect the GitHub repo, set Framework to Vite, leave Root Directory blank, Build Command `npm run build`, Output Directory `dist`. Set environment variables (VITE_FIREBASE_CONFIG, VITE_APP_ID, etc.).
