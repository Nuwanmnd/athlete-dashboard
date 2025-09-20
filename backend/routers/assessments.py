from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.get("/athlete/{athlete_id}", response_model=List[schemas.AssessmentOut])
def list_by_athlete(athlete_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Assessment)
        .filter(models.Assessment.athlete_id == athlete_id)
        .order_by(models.Assessment.date.desc().nullslast(), models.Assessment.created_at.desc())
        .all()
    )

@router.post("/", response_model=schemas.AssessmentOut)
def create_assessment(payload: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    obj = models.Assessment(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
