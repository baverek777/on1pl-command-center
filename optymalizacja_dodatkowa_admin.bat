@echo off
:: Skrypt opcjonalnych optymalizacji sieciowych i systemowych (wymaga uruchomienia jako Administrator)
echo ===================================================
echo [1/3] Wylaczanie Green Ethernet i oszczedzania energii na karcie sieciowej...
powershell -NoProfile -Command "Get-NetAdapterAdvancedProperty -Name 'Ethernet' | Where-Object { $_.DisplayName -match 'Green Ethernet|Power Saving|Gigabit Lite' } | ForEach-Object { Set-NetAdapterAdvancedProperty -Name 'Ethernet' -DisplayName $_.DisplayName -DisplayValue 'Disabled' -ErrorAction SilentlyContinue }"

echo [2/3] Optymalizacja Windows Delivery Optimization (tylko siec lokalna, bez uploadu w tle)...
powershell -NoProfile -Command "Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization' -Name 'DODownloadMode' -Value 1 -Type DWord -ErrorAction SilentlyContinue"

echo [3/3] Aktywacja planu zasilania 'Najwyzsza wydajnosc' (Ultimate Performance)...
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1
for /f "tokens=4" %%a in ('powercfg /list ^| findstr /i "Najwyzsza Ultimate"') do powercfg /setactive %%a >nul 2>&1

echo ===================================================
echo Gotowe! Wszystkie opcjonalne optymalizacje zostaly zaaplikowane.
pause
