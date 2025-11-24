# Brutus AI front-end

This folder contains the Vite + React front-end for Brutus AI. To run locally from the repository root:

```powershell
cd "C:\Users\pasca\Desktop\Brutus Ai code"
npm.cmd install
npm.cmd run dev
```

To build for production:

```powershell
npm.cmd run build
```

Vercel: Connect the GitHub repo, set Framework to Vite, leave Root Directory blank, Build Command `npm run build`, Output Directory `dist`. Set environment variables (`VITE_FIREBASE_CONFIG`, `VITE_APP_ID`, `VITE_GEMINI_API_KEY`, `VIDEO_API_URL`, `VIDEO_API_KEY`).

Note: If you encounter PowerShell `npm.ps1` execution policy errors, use `npm.cmd` (as shown) or adjust your execution policy.

Deployment / Push helper

1) Commit & push prepared repository to GitHub (Windows PowerShell):

```powershell
cd "C:\Users\pasca\Desktop\Brutus Ai code"
git status
git add .
git commit -m "chore: prepare Vite frontend + serverless api for deployment" || Write-Host "No changes to commit"
git push origin main
# If your remote has a different history and you understand the consequences, you can force:
# git push --force origin main
```

2) Vercel setup checklist
- Create (or select) a Vercel Project and connect it to this GitHub repository.
- Framework Preset: Vite (or Static Build). Root Directory: leave blank.
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variables (set in Vercel Project > Settings > Environment Variables):
	- `VITE_FIREBASE_CONFIG` — JSON string containing Firebase config (see sample below)
	- `VITE_APP_ID` — small identifier used in Firestore paths
	- `VITE_GEMINI_API_KEY` — (optional) Gemini API key for prompt generation
	- `VIDEO_API_URL` — upstream video generation API (used by serverless proxy)
	- `VIDEO_API_KEY` — upstream API key (server-side only)

Sample `VITE_FIREBASE_CONFIG` (paste as a single-line JSON value into Vercel):

```json
{"apiKey":"ABC...","authDomain":"your-app.firebaseapp.com","projectId":"your-app","storageBucket":"your-app.appspot.com","messagingSenderId":"123","appId":"1:123:web:abc"}
```

3) Verify deployment
- After push, trigger a Deploy in Vercel. Check Build Logs: `npm ci` (or `npm install`) and `vite build` must complete successfully and `dist/` must be present.
- Open the deployed URL and test flows: anonymous login, prompt generation, image generation, and "Video generieren" which calls `/api/generate-video`.

If you want, run the included Windows helper script `push_and_deploy.cmd` from the repository root to perform the basic commit/push (it will not change remote settings or push forcefully).
# Brutus AI — Vite + Tailwind + Vercel

Kurzanleitung um die App lokal zu starten und auf Vercel zu deployen.

Lokal (im `src`-Ordner, da das Workspace-Root `src` ist):

```powershell
cd "C:\Users\pasca\Desktop\Brutus Ai code\src"
npm install
npm run dev
```

Build für Production:

```powershell
npm run build
npm run preview
```

Vercel:
- Erstelle ein Projekt in Vercel und verbinde dein Repo (oder deploye via CLI).
- Setze die Environment-Variablen (z. B. `VITE_FIREBASE_CONFIG`, `VITE_GEMINI_API_KEY`, `VITE_APP_ID`) im Vercel Dashboard.
- Build Command: `npm run build`
- Output Directory: `dist`

Troubleshooting:
- Falls Tailwind-Klassen nicht greifen: sicherstellen, dass `tailwindcss`, `postcss`, `autoprefixer` installiert sind und `index.css` importiert wird (in `src/main.jsx` ist `./index.css` importiert).
- Firebase: `VITE_FIREBASE_CONFIG` erwartet ein JSON-String. In Vercel kann man dies als einzelne Variable setzen (JSON ohne Zeilenumbrüche empfohlen).

Optional: Dockerfile oder zusätzliche CI-Skripte können hinzugefügt werden.
 
CI
--
Eine GitHub Actions Workflow-Datei wurde hinzugefügt unter `.github/workflows/ci.yml`. Sie führt bei jedem Push/PR einen `npm ci` und `npm run build` aus und lädt das `dist`-Verzeichnis als Artefakt hoch.

Vercel Deployment Hinweise
--
 - Root Directory / Project Path: `src` (aktuell sind die Projektdateien im `src`-Ordner abgelegt). Wenn du stattdessen das Projekt-Layout in das Repository-Root verschieben möchtest, sag Bescheid.
 - Build Command: `npm run build`
 - Output Directory: `dist`
 - Wichtige Environment-Variablen: `VITE_FIREBASE_CONFIG` (JSON), `VITE_GEMINI_API_KEY`, `VITE_APP_ID`, optional `VITE_VIDEO_API_URL`.

Wenn du möchtest, kann ich die CI-Datei anpassen (z. B. Tests hinzufügen, Linting, oder ein Deployment-Job zu Vercel/GH-Pages).

Serverless Video Proxy
--
Ich habe eine Vercel Serverless-Funktion hinzugefügt unter `api/generate-video.js` (im `src`-Ordner). Diese Funktion nimmt POST-Anfragen im Format `{ prompt, imageUrl }` und leitet sie an eine externe Video-API weiter. Sie ist gedacht als safer Proxy, damit API-Keys serverseitig bleiben.

Um die Funktion zu verwenden:
- Setze in Vercel die folgende Environment-Variable (Project Settings -> Environment Variables):
	- `VIDEO_API_URL` = deine Video-API-Endpoint (z. B. https://video.example/generate)
	- `VIDEO_API_KEY` = (falls die API einen Key erwartet)

- In der App (nach dem Deployment) kannst du `VITE_VIDEO_API_URL` auf `/api/generate-video` setzen, oder die Client-Funktion `generateVideo` wird automatisch die Umgebungsvariable in der Serverless-Funktion ansprechen, wenn du die Client-URL auf `/api/generate-video` setzt.

Wichtig: Damit Vercel die `api`-Funktionen erkennt, muss sich der Ordner `api/` (oder `src/api/` vor dem Verschieben) im Repository-Root befinden, oder du musst deine Projektstruktur so verschieben, dass `api/` im Projekt-Root liegt.
