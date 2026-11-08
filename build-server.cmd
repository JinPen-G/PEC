@echo off
setlocal
cd /d "%~dp0"
call npm run build:web && npm run build:runtime && npm run release:package
exit /b %errorlevel%
