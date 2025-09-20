#!/usr/bin/env bash
set -euo pipefail

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Backend
cd "$ROOT/backend"
python3 -m venv .venv || true
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
# Launch backend
(.venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload) &

# Frontend
cd "$ROOT/frontend"
[ -f .env.local ] || echo "VITE_API_BASE=/api" > .env.local
npm install
# Launch frontend
(npm run dev -- --host) &

sleep 2
open "/api" 2>/dev/null || xdg-open "/api" 2>/dev/null || true
wait
