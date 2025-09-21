# backend/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import athletes, assessments, movements, injuries, comments, dashboard, auth
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from uuid import uuid4
import shutil
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"

# Static uploads (mount at both /uploads and /api/uploads for convenience)
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount(f"{API_PREFIX}/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads_api")

# Upload endpoints at /api/upload
@app.post(f"{API_PREFIX}/upload")
async def upload_api(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    name = f"{uuid4().hex}{ext}"
    dest = UPLOAD_DIR / name
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"url": f"/uploads/{name}"}

# (Optional backwards-compat: older code hitting /upload will still work locally)
@app.post("/upload")
async def upload_compat(file: UploadFile = File(...)):
    return await upload_api(file)

# Routers → all under /api
app.include_router(auth.router,       prefix=API_PREFIX)
app.include_router(athletes.router,   prefix=API_PREFIX)
app.include_router(assessments.router, prefix=API_PREFIX)
app.include_router(movements.router,  prefix=API_PREFIX)
app.include_router(injuries.router,   prefix=API_PREFIX)
app.include_router(comments.router,   prefix=API_PREFIX)
app.include_router(dashboard.router,  prefix=API_PREFIX)

@app.get("/", tags=["root"])
def root():
    return {"ok": True, "service": "Dashboard API"}
