@echo off
setlocal enabledelayedexpansion

REM scripts\start_dev.bat
set ROOT=%~dp0..
pushd "%ROOT%"

REM --- Backend
cd backend
if not exist .venv (
  echo Creating Python virtualenv...
  py -3 -m venv .venv
)
call .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
start "Backend (Uvicorn)" cmd /k ".venv\Scripts\uvicorn.exe backend.main:app --host 127.0.0.1 --port 8000 --reload"
popd

REM --- Frontend
pushd "%ROOT%\frontend"
if not exist .env.local (
  echo VITE_API_BASE=/api> .env.local
)
call npm install
start "Frontend (Vite)" cmd /k "npm run dev -- --host"
popd

start "" /api
endlocal
