# backend/models.py
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timedelta
from .database import Base
from typing import Optional

class Athlete(Base):
    __tablename__ = "athletes"
    id = Column(Integer, primary_key=True, index=True)

    # Basic identity
    first_name = Column(String, nullable=False)
    last_name  = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    sport = Column(String, nullable=True)
    position = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    email = Column(String, nullable=True)
    city = Column(String, nullable=True)

    # Summary
    level = Column(String, nullable=True)          # Youth, High School, etc.
    club_team = Column(String, nullable=True)
    mom_name = Column(String, nullable=True)
    dad_name = Column(String, nullable=True)

    # Medical history
    medical_conditions = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    medications = Column(Text, nullable=True)

    # Background & Experience
    achievements = Column(Text, nullable=True)
    practice_frequency = Column(String, nullable=True)
    workout_frequency = Column(String, nullable=True)
    skill_frequency = Column(String, nullable=True)
    development_level = Column(String, nullable=True)
    nutrition_habits = Column(Text, nullable=True)
    hydration_habits = Column(Text, nullable=True)
    supplements = Column(Text, nullable=True)
    sleep_habits = Column(Text, nullable=True)

    # Training objectives
    goal_long_term = Column(Text, nullable=True)
    goal_sport_specific = Column(Text, nullable=True)
    goal_athlete_specific = Column(Text, nullable=True)

    # Coach notes
    coach_athlete_mentality = Column(Text, nullable=True)
    coach_athlete_personality = Column(Text, nullable=True)
    coach_prehab_needs = Column(Text, nullable=True)
    coach_testing_request = Column(Text, nullable=True)
    coach_supplement_requests = Column(Text, nullable=True)
    coach_notes = Column(Text, nullable=True)

    # Coach IQ
    iq_training_style = Column(Text, nullable=True)
    iq_motivation_work_ethic = Column(Text, nullable=True)
    iq_learning_preference = Column(Text, nullable=True)
    iq_communication_preference = Column(Text, nullable=True)

    # Misc
    additional_comments = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # IMPORTANT: cascade + delete-orphan and passive_deletes so FK ondelete=CASCADE can be honored by DBs that support it.
    assessments = relationship(
        "Assessment",
        back_populates="athlete",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    movement_assessments = relationship(
        "MovementAssessment",
        back_populates="athlete",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    injuries = relationship(
        "Injury",
        back_populates="athlete",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    notes = relationship(
        "Note",
        back_populates="athlete",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False)

    date = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    cmf_left = Column(Float, nullable=True)
    cmf_right = Column(Float, nullable=True)
    cmp_left = Column(Float, nullable=True)
    cmp_right = Column(Float, nullable=True)
    ratio_left = Column(Float, nullable=True)
    ratio_right = Column(Float, nullable=True)
    custom_target = Column(Float, nullable=True)
    goal = Column(String, nullable=True)
    recommendation_summary = Column(Text, nullable=True)
    coach_comment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    athlete = relationship("Athlete", back_populates="assessments")


class MovementAssessment(Base):
    __tablename__ = "movement_assessments"
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False)

    selections_json = Column(Text, nullable=True)  # raw selections
    analysis_json = Column(Text, nullable=True)    # { over:[], under:[] }
    athlete_comment = Column(Text, nullable=True)
    coach_comment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    athlete = relationship("Athlete", back_populates="movement_assessments")


class Injury(Base):
    __tablename__ = "injuries"
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False)

    date_reported = Column(Date, nullable=True)
    area = Column(String, nullable=True)
    severity = Column(String, nullable=True)  # Minor | Moderate | Severe
    status = Column(String, nullable=True)    # Active | Recovering | Resolved
    recovery_plan = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    # Optional (Profile preview)
    diagnosis = Column(Text, nullable=True)
    mechanism = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    athlete = relationship("Athlete", back_populates="injuries")


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    athlete_id: Mapped[int] = mapped_column(ForeignKey("athletes.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    author: Mapped[Optional[str]] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    athlete: Mapped["Athlete"] = relationship("Athlete", back_populates="notes")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="owner")         # owner / coach etc.
    is_active = Column(Boolean, default=True)
    reset_token = Column(String, nullable=True)
    reset_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
