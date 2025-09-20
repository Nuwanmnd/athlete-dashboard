# backend/routers/files.py
from fastapi import APIRouter, File, UploadFile
from pathlib import Path
from uuid import uuid4
import shutil

router = APIRouter(tags=["files"])
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/files/photo")
async def upload_photo(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix or ".bin"
    name = f"{uuid4().hex}{ext}"
    dest = UPLOAD_DIR / name
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    # return a path your frontend can use directly
    return {"url": f"/uploads/{name}"}
