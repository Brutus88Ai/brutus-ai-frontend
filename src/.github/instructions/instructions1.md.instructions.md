# Copilot / AI Agent Instructions — Brutus AI Frontend

Purpose: give AI agents concise, actionable context so they can make small, safe edits and validate them locally.

Architecture (quick)
- Frontend: Vite + React SPA. Entry: `index.html` → `main.jsx` → `src/App.jsx` (primary logic: auth, Firestore listeners, generation flows).
- Serverless: `api/generate-video.js` (POST {prompt,imageUrl}) proxies to an upstream `VIDEO_API_URL` and reads `VIDEO_API_KEY` server-side.
- Data: Firebase (client SDK). Firestore collections use paths like `artifacts/{appId}/users/{userId}/prompts|uploads|profile`.

Files to read first
- `src/App.jsx` — the behavior hub (helpers: `parseJsonSafe`, `generateBasePrompts`, `generateImage`, `generateVideo`, `saveUpload`, `useFirestore`).
- `vite.config.js` — injects `__firebase_config`, `__app_id`, `__initial_auth_token` into the client bundle.
- `api/generate-video.js` — serverless proxy; change signature only if you update the client call in `App.jsx`.
- `vercel.json` — Vercel routing and static-build settings.

How to run & debug (explicit)
- From repository root on Windows (use `npm.cmd` to avoid PowerShell script policy issues):
  - `npm.cmd install`
  - `npm.cmd run dev` (dev server)
  - `npm.cmd run build` (produces `dist/`)
  - `npm.cmd run preview` (serve built site)
- Vercel: Framework = Vite, Build Command = `npm run build`, Output Directory = `dist`. Remove any `cd`/`vercel login` commands from Vercel project settings.

Environment variables (exact mapping)
- `VITE_FIREBASE_CONFIG` — JSON string injected into `__firebase_config` and parsed in `App.jsx`.
- `VITE_APP_ID` — used to build Firestore document paths (client sanitizes it).
- `VITE_GEMINI_API_KEY` — used by `generateBasePrompts` for Gemini calls.
- `VITE_VIDEO_API_URL` / `VIDEO_API_URL` and `VIDEO_API_KEY` — used by `api/generate-video.js`; keep `VIDEO_API_KEY` server-side in Vercel envs.

Project-specific conventions & gotchas
- Parsers: `parseJsonSafe` intentionally extracts the first JSON array from free-text responses. Maintain its tolerant behavior when changing prompt parsing.
- Firestore listeners: `useFirestore` uses `onSnapshot` and unsubscribes in cleanup; preserve this to avoid leaks.
- Secrets: prefer serverless proxies for any external API with keys (see `api/generate-video.js`). Do not embed secrets in client-side envs.
- CSS: repository currently contains a minimal CSS fallback for builds without Tailwind; reintroducing Tailwind requires restoring `postcss.config.cjs` and devDependencies.

Concrete examples
- Firestore write (from `saveUpload`): adds a doc to `artifacts/${appId}/users/${userId}/uploads` with `{ prompt, imageUrl, videoUrl, platform, status, uploadDate }`.
- Serverless API call (client): POST `/api/generate-video` with JSON `{ "prompt": "...", "imageUrl": "..." }` → expects `{ "videoUrl": "..." }`.

Checklist for changes
1. Make minimal, focused changes. Run `npm run build` locally and verify no build-time injection failures.
2. If you add or rename env vars: update `vite.config.js`, `README.md`, and Vercel project envs together.
3. Avoid committing secrets. Use serverless functions for keyed services.

If you want, I will add one of the following next (pick one):
- sample `VITE_FIREBASE_CONFIG` JSON template
- a small smoke-test script that hits `/api/generate-video` and attempts a Firestore write (requires credentials/placeholders)
- a CI step that runs `npm run build` and uploads the `dist` artifact

End of instructions.
---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Copilot / AI Agent Instructions — Brutus AI Frontend (concise)



Purpose:Act as an autonomous Senior Developer. Analyze the code and fix all errors (syntax, logic, bugs) immediately without asking for clarification. Perform a strict self-review after fixing. If errors remain, iterate internally until the code is 100% error-free. Output only the complete, functioning code. Apply surgical changes, validate locally, and preserve runtime behavior.

Quick architecture
- Vite + React SPA. Entry: `index.html` → `main.jsx` → `App.jsx` (most logic lives in `App.jsx`).
- Serverless API: `api/generate-video.js` proxies POST {prompt, imageUrl} → upstream `VIDEO_API_URL` (auth via `VIDEO_API_KEY`).
- Firebase: client SDK initialized from build-time injected `__firebase_config` (set via `vite.config.js`). Firestore paths: `artifacts/{appId}/users/{userId}/prompts|uploads|profile`.

Essential files to inspect
- `App.jsx` — auth, Firestore listeners, prompt/image/video flows (`parseJsonSafe`, `generateBasePrompts`, `generateImage`, `generateVideo`).
- `vite.config.js` — injects `__firebase_config`, `__app_id`, `__initial_auth_token`. Update when adding build-time envs.
- `api/generate-video.js` — serverless proxy; keep the POST shape {prompt,imageUrl}.
- `vercel.json` — routes + build config (static-build).

Build & debug (Windows specifics)
- Repo root commands (use `npm.cmd` on Windows if PowerShell blocks scripts):
  - Install: `npm.cmd install`
  - Dev: `npm.cmd run dev`
  - Build: `npm.cmd run build` (outputs `dist/`)
  - Preview: `npm.cmd run preview`
- Vercel: Framework = Vite / Build = `npm run build` / Output = `dist`. Remove any `cd` or `vercel login` in Vercel config.

Environment variables (where used)
- `VITE_FIREBASE_CONFIG` — JSON string injected into `__firebase_config` and parsed in `App.jsx`.
- `VITE_APP_ID` — forms Firestore app path; sanitized in `App.jsx`.
- `VITE_GEMINI_API_KEY` — used by `generateBasePrompts` (Gemini endpoint).
- `VITE_VIDEO_API_URL` / `VIDEO_API_URL` & `VIDEO_API_KEY` — used by `api/generate-video.js` (keep keys server-side).

Project conventions & gotchas
- Keep secrets out of client bundles — prefer serverless proxy for third-party APIs.
- `parseJsonSafe` tolerantly extracts the first JSON array from text — preserve this when changing parsers.
- Firestore listeners use `onSnapshot` and must unsubscribe (pattern already present in `useFirestore`).
- The project includes a minimal CSS fallback to allow builds without Tailwind; if adding Tailwind, restore `postcss` and `tailwindcss` configs.

Quick examples
- Firestore write (in `saveUpload`): adds doc to `artifacts/${appId}/users/${userId}/uploads` with fields `{ prompt, imageUrl, videoUrl, platform, status, uploadDate }`.
- Serverless call (client): POST `/api/generate-video` with JSON `{ prompt, imageUrl }` → expects `{ videoUrl }`.

Checklist for changes
- Run `npm run build` locally before opening PR.
- If adding env names: update `vite.config.js`, README, and Vercel settings together.
- Keep PRs small; preserve behavior and add tests only if you also add a test harness.


