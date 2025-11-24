@echo off
REM Build helper for Windows (run from project `src` folder)
echo Installing dependencies (using npm.cmd)...
npm.cmd install
if errorlevel 1 (
  echo npm install failed
  exit /b 1
)
echo Running production build...
npm.cmd run build
if errorlevel 1 (
  echo Build failed
  exit /b 1
)
echo Build completed successfully.
pause
