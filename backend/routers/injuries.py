from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/injuries", tags=["injuries"])

@router.get("/{athlete_id}", response_model=List[schemas.InjuryOut])
def list_by_athlete(athlete_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Injury)
        .filter(models.Injury.athlete_id == athlete_id)
        .order_by(models.Injury.date_reported.desc(), models.Injury.created_at.desc())
        .all()
    )

@router.post("/", response_model=schemas.InjuryOut)
def create_injury(payload: schemas.InjuryCreate, db: Session = Depends(get_db)):
    obj = models.Injury(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
