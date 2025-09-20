@echo off
setlocal EnableExtensions EnableDelayedExpansion
title TAG Dashboard – Setup & Run (Windows)

REM ==== Always start at the folder where this script lives ====
cd /d "%~dp0"

echo.
echo ① Checking Python...
where py >NUL 2>&1
if errorlevel 1 (
  echo    Python not found. Trying to install Python via winget...
  winget --version >NUL 2>&1
  if errorlevel 1 (
    echo    winget is not available. Please install Python 3.11+ from:
    echo    https://www.python.org/downloads/windows/
    echo    Then run this script again.
    pause
    exit /b
  )
  winget install Python.Python.3.11 -e --silent
  echo    When installation finishes, please run this script again.
  pause
  exit /b
)

set "PY=py -3"

echo.
echo ② Creating/activating backend venv...
%PY% -m venv backend\.venv
call backend\.venv\Scripts\activate.bat

echo.
echo ③ Installing backend dependencies...
if exist "backend\requirements.txt" (
  pip install -r backend\requirements.txt
) else (
  echo    No requirements.txt found. Installing essentials...
  pip install fastapi "uvicorn[standard]" sqlalchemy pydantic "python-multipart"
)

echo.
echo ④ Checking Node.js...
where node >NUL 2>&1
if errorlevel 1 (
  echo    Node.js not found. Trying to install Node LTS via winget...
  winget --version >NUL 2>&1
  if errorlevel 1 (
    echo    winget is not available. Please install Node.js LTS from:
    echo    https://nodejs.org/
    echo    Then run this script again.
    pause
    exit /b
  )
  winget install OpenJS.NodeJS.LTS -e --silent
  echo    When installation finishes, please run this script again.
  pause
  exit /b
)

echo.
echo ⑤ Preparing frontend env (.env.local)...
if not exist "frontend\.env.local" (
  echo VITE_API_BASE=/api> "frontend\.env.local"
)

echo.
echo ⑥ Installing frontend packages (first run only)...
pushd frontend
if exist node_modules (
  echo    node_modules already present. Skipping install.
) else (
  if exist package-lock.json (
    npm ci
  ) else (
    npm install
  )
)
popd

echo.
echo ⑦ Starting BACKEND server...
REM Start in a new window with a stable title, and keep it open (/k)
start "TAG Backend" cmd /k "cd /d %~dp0 && call backend\.venv\Scripts\activate.bat && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo ⑧ Starting FRONTEND dev server...
start "TAG Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev -- --host"

REM Give the servers a moment, then open the browser
timeout /t 2 >NUL
start "" "/api"

echo.
echo ✅ All set! Two terminal windows opened: "TAG Backend" and "TAG Frontend".
echo    Keep them open while you use the app. The dashboard should be in your browser.
echo.
pause
