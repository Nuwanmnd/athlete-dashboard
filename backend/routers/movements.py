from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/movement-assessments", tags=["movement"])

@router.get("/athlete/{athlete_id}", response_model=List[schemas.MovementOut])
def list_by_athlete(athlete_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.MovementAssessment)
        .filter(models.MovementAssessment.athlete_id == athlete_id)
        .order_by(models.MovementAssessment.created_at.asc())
        .all()
    )

@router.post("/", response_model=schemas.MovementOut)
def create_movement(payload: schemas.MovementCreate, db: Session = Depends(get_db)):
    obj = models.MovementAssessment(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
