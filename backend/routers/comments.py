# backend/routers/comments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, cast
from datetime import datetime
import json

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["notes"])

def to_out(n: models.Note) -> schemas.NoteOut:
    return schemas.NoteOut(
        id=cast(int, n.id),
        athlete_id=cast(int, n.athlete_id),
        text=cast(str, n.text),
        tags=json.loads(cast(str, n.tags or "[]")),
        pinned=bool(n.pinned),
        author=cast(str, n.author) if n.author is not None else None,
        created_at=cast(datetime, n.created_at),
    )

@router.get("/athletes/{athlete_id}/notes", response_model=List[schemas.NoteOut])
def list_notes_alias(athlete_id: int, db: Session = Depends(get_db)):
    # reuse same listing logic
    items = (
        db.query(models.Note)
        .filter(models.Note.athlete_id == athlete_id)
        .order_by(models.Note.pinned.desc(), models.Note.created_at.desc())
        .all()
    )
    return items  # NoteOut validator now parses tags for us


@router.post("/notes", response_model=schemas.NoteOut)
def create_note(payload: schemas.NoteCreate, db: Session = Depends(get_db)):
    obj = models.Note(
        athlete_id=payload.athlete_id,
        text=payload.text,
        tags=json.dumps(payload.tags or []),
        author=payload.author or "Coach",
        pinned=False,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return to_out(obj)

@router.patch("/notes/{note_id}/pin", response_model=schemas.NoteOut)
def pin_note(note_id: int, body: schemas.PinPatch, db: Session = Depends(get_db)):
    obj = db.get(models.Note, note_id)   # modern get()
    if not obj:
        raise HTTPException(status_code=404, detail="Note not found")
    obj.pinned = body.pinned
    db.commit()
    db.refresh(obj)
    return to_out(obj)

@router.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Note, note_id)   # modern get()
    if obj:
        db.delete(obj)
        db.commit()
    return
