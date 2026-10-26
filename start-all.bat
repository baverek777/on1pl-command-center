@echo off
title ^ON1PL^ Command Center & Bot Launcher
cd /d %~dp0
echo ========================================================
echo   Uruchamianie ^ON1PL^ Command Center & Bota Discord
echo ========================================================
echo.
echo [1/2] Startowanie serwera bota Discord...
start "ON1PL Discord Bot Backend" cmd /k "cd bot && node index.js"
echo [2/2] Startowanie panelu webowego...
start "ON1PL Command Center Web" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo Otwieranie w przegladarce...
start http://localhost:5173
echo.
echo Gotowe! Panel dziala pod http://localhost:5173
