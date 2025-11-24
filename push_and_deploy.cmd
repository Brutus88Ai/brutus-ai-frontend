@echo off
REM push_and_deploy.cmd - basic safe push helper for Windows
cd /d "%~dp0"
echo Repository root: %CD%
echo Showing git status...
git status

echo Adding files and committing if needed...
git add .
git commit -m "chore: prepare Vite frontend + serverless api for deployment" || echo "No changes to commit"

echo Pushing to origin main...
git push origin main

if errorlevel 1 (
  echo Push failed. If you need to force push, run:
  echo   git push --force origin main
  exit /b 1
)

echo Push succeeded. Now visit Vercel dashboard to trigger/verify deployment.
echo Tip: Ensure Vercel env vars are set (VITE_FIREBASE_CONFIG, VITE_APP_ID, VIDEO_API_URL, VIDEO_API_KEY, VITE_GEMINI_API_KEY).
pause
