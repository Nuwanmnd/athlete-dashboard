@echo off
title TAG Dashboard – Close Servers (Windows)

echo Closing servers...

REM Try to close the two CMD windows we started by their titles
taskkill /FI "WINDOWTITLE eq TAG Backend" /F /T >NUL 2>&1
taskkill /FI "WINDOWTITLE eq TAG Frontend" /F /T >NUL 2>&1

REM Fallback: kill whatever is listening on ports 8000 and 5173 (backend & Vite)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 8000,5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Get-Unique | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {} }"

echo Done. If any windows are still open, you can close them manually.
pause
