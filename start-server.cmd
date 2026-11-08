@echo off
setlocal
cd /d "%~dp0"
call npm run serve -- --bootstrap
exit /b %errorlevel%
