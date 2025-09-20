#!/bin/bash
set -e
# Kill anything on the usual dev ports:
if lsof -ti tcp:8000 >/dev/null 2>&1; then
  lsof -ti tcp:8000 | xargs kill -9 || true
fi
if lsof -ti tcp:5173 >/dev/null 2>&1; then
  lsof -ti tcp:5173 | xargs kill -9 || true
fi
# Also try common process names (harmless if not running)
pkill -f "uvicorn main:app" || true
pkill -f "vite" || true
pkill -f "npm run dev" || true
osascript -e 'display notification "Servers stopped" with title "Athlete Dashboard"'
