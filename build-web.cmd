@echo off
setlocal
cd /d "%~dp0"
call npm run build:web
exit /b %errorlevel%
