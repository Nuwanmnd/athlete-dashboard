# Athlete Dashboard (Local Setup)

A small FastAPI + React/Vite app to manage athletes, assessments, movement screens, injuries, notes, and photos — with clean local setup.

## What this includes

- **Backend**: FastAPI, SQLAlchemy, uploads folder mounted at `/uploads`
- **Frontend**: React (Vite), Tailwind, shadcn/ui
- **Live features**: avatar upload, assessments (with graphs + confirm), movement (live summary + confirm), injuries (confirm), notes, profile roll-ups, delete athlete (with cascade + avatar cleanup)

---

## Quick Start (Windows)

### One-click

1. Open the repo folder.
2. Right-click `scripts/windows_setup_and_run.ps1` → **Run with PowerShell**  
   (If blocked, run: `powershell -ExecutionPolicy Bypass -File .\scripts\windows_setup_and_run.ps1`)
3. Two terminal windows will open (backend + frontend) and a browser tab will open at **/api**.

> The script will install Python 3.11 and Node.js LTS via **winget** if they’re missing (you might see installer prompts).

### If you already have Python & Node

Double-click `scripts/start_dev.bat`.

---

## Quick Start (Mac / Linux)

```bash
./scripts/setup_and_run.sh
```
