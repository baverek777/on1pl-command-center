@echo off
title ^ON1PL^ AI Hub - Server + Tunnel
echo.
echo  ==============================================
echo     ^ON1PL^ AI Hub (Local + Public HTTPS)
echo  ==============================================
echo.
cd /d "c:\Antygravity"

echo [*] Odpalam lokalny serwer Streamlit na porcie 8501...
start "Streamlit Server" /B python -m streamlit run app.py --server.headless true --server.address 0.0.0.0 --server.port 8501

timeout /t 3 >nul

echo [*] Odpalam bezpieczny tunel Cloudflare HTTPS...
start "Cloudflare Tunnel" c:\Antygravity\cloudflared.exe tunnel --url http://localhost:8501

echo.
echo ==============================================================
echo [OK] Serwer dziala lokalnie:  http://localhost:8501
echo [OK] Serwer na telefonie:     http://192.168.0.2:8501
echo [OK] W oknie Cloudflared znajdziesz swoj unikalny link HTTPS!
echo ==============================================================
echo.
pause
