# backend/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from typing import Any, Optional
from datetime import date as _date, datetime as _dt


def _iso(v: Any) -> Optional[str]:
    # only serialize real date/datetime values
    if isinstance(v, (_date, _dt)):
        return v.isoformat()
    return None

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    # ---- counts
    total_athletes = db.query(models.Athlete).count()
    total_assessments = db.query(models.Assessment).count()
    # If your model is MovementAssessment, change to models.MovementAssessment
    total_movement = db.query(models.MovementAssessment).count()
    active_ids = {
        r.athlete_id
        for r in db.query(models.Injury)
        .filter(models.Injury.status.in_(["Active", "Recovering"]))
        .all()
    }

    # ---- latest lists (limit what you need)
    latest_athletes = [
        {
            "id": a.id,
            "first_name": a.first_name,
            "last_name": a.last_name,
            "level": a.level,
            "sport": a.sport,
        }
        for a in db.query(models.Athlete)
        .order_by(models.Athlete.created_at.desc())
        .limit(10)
        .all()
    ]
    items: list[models.Assessment] = (
    db.query(models.Assessment)
      .order_by(models.Assessment.created_at.desc())
      .limit(10)
      .all()
)

    latest_assessments = [
        {
            "id": x.id,
            "athlete_id": x.athlete_id,
            "date": _iso(getattr(x, "date", None)),
            "created_at": _iso(getattr(x, "created_at", None)),
        }
        for x in items
]
    movements_q = (
    db.query(models.MovementAssessment)
    .order_by(models.MovementAssessment.created_at.desc())
    .limit(10)
    .all()
)

    latest_movements = [
        {
            "id": x.id,
            "athlete_id": x.athlete_id,
            "created_at": _iso(getattr(x, "created_at", None)),
        }
        for x in movements_q
]
    injuries_q = (
    db.query(models.Injury)
    .order_by(models.Injury.created_at.desc())
    .limit(10)
    .all()
)

    latest_injuries = [
        {
            "id": x.id,
            "athlete_id": x.athlete_id,
            "status": x.status,
            "area": x.area,
            "date_reported": _iso(getattr(x, "date_reported", None)),
        }
        for x in injuries_q
    ]

    return {
        "total_athletes": total_athletes,
        "total_assessments": total_assessments,
        "total_movement_assessments": total_movement,
        "injured_athletes": len(active_ids),
        "latest_athletes": latest_athletes,
        "latest_assessments": latest_assessments,
        "latest_movements": latest_movements,
        "latest_injuries": latest_injuries,
    }
