# backend/routers/athletes.py
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from typing import List, Any
from pathlib import Path

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/athletes", tags=["athletes"])

@router.get("/", response_model=List[schemas.AthleteOut])
def list_athletes(db: Session = Depends(get_db)):
    return db.query(models.Athlete).order_by(models.Athlete.id.desc()).all()

@router.get("/{athlete_id}", response_model=schemas.AthleteOut)
def get_athlete(athlete_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Athlete, athlete_id)  # SQLAlchemy 2.x style
    if not obj:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return obj

@router.post("/", response_model=schemas.AthleteOut, status_code=status.HTTP_201_CREATED)
def create_athlete(payload: schemas.AthleteCreate, db: Session = Depends(get_db)):
    obj = models.Athlete(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/{athlete_id}/notes", response_model=List[schemas.NoteOut])
def notes_for_athlete(athlete_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Note)
        .filter(models.Note.athlete_id == athlete_id)
        .order_by(models.Note.pinned.desc(), models.Note.created_at.desc())
        .all()
    )

@router.patch("/{athlete_id}", response_model=schemas.AthleteOut)
def update_athlete(athlete_id: int, payload: schemas.AthleteUpdate, db: Session = Depends(get_db)):
    obj = db.get(models.Athlete, athlete_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Athlete not found")
    data: dict[str, Any] = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{athlete_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_athlete(athlete_id: int, db: Session = Depends(get_db)):
    """
    Permanently delete an athlete and all related records (assessments,
    movement assessments, injuries, notes). The ORM relationships in
    models.py are configured with cascade, so children are removed as well.
    Also attempts to delete the local photo file if stored under /uploads.
    """
    obj = db.get(models.Athlete, athlete_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Athlete not found")

    # best-effort cleanup of uploaded avatar
    try:
        if obj.photo_url and obj.photo_url.startswith("/uploads/"):
            rel = obj.photo_url.split("/uploads/", 1)[-1]
            (Path("uploads") / rel).unlink(missing_ok=True)
    except Exception:
        pass  # non-fatal

    db.delete(obj)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
