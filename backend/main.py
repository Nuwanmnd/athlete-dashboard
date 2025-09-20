from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import athletes, assessments, movements, injuries, comments, dashboard
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from uuid import uuid4
import shutil

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["/api", "/api", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    name = f"{uuid4().hex}{ext}"
    dest = UPLOAD_DIR / name
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"url": f"/uploads/{name}"}

app.include_router(athletes.router)
app.include_router(assessments.router)
app.include_router(movements.router)
app.include_router(injuries.router)
app.include_router(comments.router)
app.include_router(dashboard.router)

@app.get("/", tags=["root"])
def root():
    return {"ok": True, "service": "Dashboard API"}
