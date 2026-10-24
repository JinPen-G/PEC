@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not available in PATH.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies (first run only)...
  call npm install --omit=dev
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting platform server on http://0.0.0.0:5188 ...
echo - dist/ is served as the platform UI
echo - route / project / PRD management writes: server host always; any browser after
echo   enabling remoteManagement in platform-settings.json (控制台 - 远程管理)
echo.
node scripts/platform-server.mjs --host 0.0.0.0 --port 5188
pause
