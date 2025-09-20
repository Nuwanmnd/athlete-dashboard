from sqlalchemy.orm import Session
from . import models, schemas

def create_athlete(db: Session, athlete: schemas.AthleteCreate):
    db_athlete = models.Athlete(**athlete.dict())
    db.add(db_athlete)
    db.commit()
    db.refresh(db_athlete)
    return db_athlete

def create_assessment(db: Session, assessment: schemas.AssessmentCreate):
    db_assessment = models.Assessment(**assessment.dict())
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

def create_injury(db: Session, injury: schemas.InjuryCreate):
    db_injury = models.Injury(**injury.dict())
    db.add(db_injury)
    db.commit()
    db.refresh(db_injury)
    return db_injury

def create_movement(db: Session, movement: schemas.MovementAssessmentCreate):
    db_movement = models.MovementAssessment(**movement.dict())
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

def create_comment(db: Session, comment: schemas.CommentCreate):
    db_comment = models.Comment(**comment.dict())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment
