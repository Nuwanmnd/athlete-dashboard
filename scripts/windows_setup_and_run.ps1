# scripts/windows_setup_and_run.ps1
Param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

function Has-Cmd($name) {
  try { Get-Command $name -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Repo root: $repoRoot"

# --- Install Python / Node via winget if missing (unless -SkipInstall is passed)
if (-not $SkipInstall) {
  if (-not (Has-Cmd python) -and -not (Has-Cmd py)) {
    if (Has-Cmd winget) {
      Write-Host "Installing Python (via winget)..." -ForegroundColor Cyan
      winget install -e --id Python.Python.3.11 -h
    } else {
      Write-Warning "Python not found and winget not available. Please install Python 3.11+ from python.org."
    }
  }
  if (-not (Has-Cmd node)) {
    if (Has-Cmd winget) {
      Write-Host "Installing Node.js LTS (via winget)..." -ForegroundColor Cyan
      winget install -e --id OpenJS.NodeJS.LTS -h
    } else {
      Write-Warning "Node.js not found and winget not available. Please install Node.js LTS from nodejs.org."
    }
  }
}

# --- Resolve Python command
$py = $(if (Has-Cmd py) { "py" } elseif (Has-Cmd python) { "python" } else { "python" })

# --- Backend: venv + deps
$backendDir = Join-Path $repoRoot "..\backend" | Resolve-Path
Set-Location $backendDir
if (-not (Test-Path ".venv")) {
  Write-Host "Creating Python virtualenv..." -ForegroundColor Cyan
  & $py -3 -m venv .venv
}
Write-Host "Installing backend requirements..." -ForegroundColor Cyan
& ".venv\Scripts\python.exe" -m pip install --upgrade pip
& ".venv\Scripts\pip.exe" install -r requirements.txt

# --- Frontend: env + deps
$frontendDir = Join-Path $repoRoot "..\frontend" | Resolve-Path
Set-Location $frontendDir
if (-not (Test-Path ".env.local")) {
  "VITE_API_BASE=/api" | Out-File -Encoding ASCII ".env.local"
}
Write-Host "Installing frontend packages..." -ForegroundColor Cyan
if (Has-Cmd npm) {
  npm install
} else {
  Write-Warning "npm is not available; please install Node.js LTS."
}

# --- Launch both apps in separate terminals
Write-Host "Launching backend + frontend..." -ForegroundColor Green

$uvicornExe = Join-Path $backendDir ".venv\Scripts\uvicorn.exe"
Start-Process -WorkingDirectory $backendDir -FilePath $uvicornExe -ArgumentList "backend.main:app","--host","127.0.0.1","--port","8000","--reload" -WindowStyle Normal -PassThru | Out-Null

Start-Process -WorkingDirectory $frontendDir -FilePath "npm.cmd" -ArgumentList "run","dev","--","--host" -WindowStyle Normal -PassThru | Out-Null

Start-Sleep -Seconds 2
Start-Process "/api"
Write-Host "All set! Browser opened at /api" -ForegroundColor Green
