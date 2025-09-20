#!/bin/bash
set -euo pipefail

# --- Locations ---
cd "$(dirname "$0")"
ROOT="$PWD"
BE="$ROOT/backend"
FE="$ROOT/frontend"

# --- Helper: log ---
say() { printf "\n🟦 %s\n" "$*"; }

# --- Homebrew (only if missing) ---
if ! command -v brew >/dev/null 2>&1; then
  say "Installing Homebrew (first run only)…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Add brew to PATH for Apple Silicon & Intel
  test -x /opt/homebrew/bin/brew && eval "$(/opt/homebrew/bin/brew shellenv)"
  test -x /usr/local/bin/brew   && eval "$(/usr/local/bin/brew shellenv)"
else
  # ensure brew is on PATH this session
  test -x /opt/homebrew/bin/brew && eval "$(/opt/homebrew/bin/brew shellenv)"
  test -x /usr/local/bin/brew   && eval "$(/usr/local/bin/brew shellenv)"
fi

# --- Node.js (only if missing) ---
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  say "Installing Node.js (first run only)…"
  brew install node
fi

# --- Python 3 (only if missing) ---
if ! command -v python3 >/dev/null 2>&1; then
  say "Installing Python 3 (first run only)…"
  brew install python@3.11 || brew install python
fi

# --- Backend: venv & deps (only if requirements changed) ---
cd "$BE"
if [ ! -d ".venv" ]; then
  say "Creating Python virtual environment…"
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

REQ_HASH_FILE=".req.hash"
NEW_HASH="$(shasum -a 256 requirements.txt | awk '{print $1}')"
OLD_HASH="$(cat "$REQ_HASH_FILE" 2>/dev/null || true)"
if [ "$NEW_HASH" != "$OLD_HASH" ]; then
  say "Installing/Updating backend Python packages…"
  pip install --upgrade pip
  pip install -r requirements.txt
  echo "$NEW_HASH" > "$REQ_HASH_FILE"
else
  say "Backend Python packages already up to date."
fi

# --- Start backend (port 8000) ---
say "Starting backend…"
uvicorn main:app --reload --port 8000 &
BACK_PID=$!

# --- Frontend: node_modules (only if missing) ---
cd "$FE"
if [ ! -d "node_modules" ]; then
  say "Installing frontend packages (first run or after clean)…"
  npm ci || npm install
else
  say "Frontend packages already present."
fi

# --- Start frontend (Vite dev server) ---
say "Starting frontend…"
npm run dev &
FRONT_PID=$!

# --- Save PIDs so STOP script can close them ---
echo "$BACK_PID"  > "$ROOT/.pids.backend" || true
echo "$FRONT_PID" > "$ROOT/.pids.frontend" || true

# --- Open the app ---
open "/api"

say "All set! Keep these Terminal windows open while using the app."
wait
