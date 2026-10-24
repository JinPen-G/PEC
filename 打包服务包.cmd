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
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Building production files for /prototype/Rental/ ...
call npm run build -- --base /prototype/Rental/
if errorlevel 1 (
  echo Production build failed.
  pause
  exit /b 1
)

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%I"
set "ARCHIVE=project-prototype-platform-server-%STAMP%.zip"
set "STAGE=%TEMP%\ppp-server-pack"

echo Staging server package...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$stage='%STAGE%'; if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }; New-Item -ItemType Directory -Path $stage | Out-Null"
if errorlevel 1 goto :packfail

REM 1) dist 产物（含构建时的 projects/health.json、html-pages.json、.platform 配置）
robocopy dist "%STAGE%\dist" //E //NFL //NDL //NJH //NJS >nul
REM 2) 平台服务运行所需源码
robocopy scripts "%STAGE%\scripts" //E //NFL //NDL //NJH //NJS >nul
robocopy packages "%STAGE%\packages" //E //NFL //NDL //NJH //NJS >nul
REM 3) 项目源（page-definitions/.platform/文档 等——服务器上可继续编辑管理数据）
robocopy projects "%STAGE%\projects" //E //NFL //NDL //NJH //NJS >nul
REM 4) 配置与启动脚本
copy /y package.json "%STAGE%\package.json" >nul
copy /y platform-settings.json "%STAGE%\platform-settings.json" >nul
copy /y 启动平台服务.cmd "%STAGE%\启动平台服务.cmd" >nul

echo Creating archive...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$stage=(Resolve-Path -LiteralPath '%STAGE%').Path; $zip=Join-Path (Get-Location).Path '%ARCHIVE%'; if (Test-Path $zip) { Remove-Item $zip }; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory($stage,$zip,[System.IO.Compression.CompressionLevel]::Optimal,$false); Remove-Item -Recurse -Force $stage"
if errorlevel 1 goto :packfail

echo.
echo Server package created:
echo %CD%\%ARCHIVE%
echo.
echo Usage: unzip on the server, run npm install (production deps only is fine),
echo then start 启动平台服务.cmd (node scripts/platform-server.mjs --host 0.0.0.0).
echo The platform UI is served from dist; route/project management writes are
echo enabled for the server host, or from any browser after enabling
echo remoteManagement in platform-settings.json (控制台 - 远程管理).
echo.
pause
exit /b 0

:packfail
echo Server package creation failed.
pause
exit /b 1
