# backend/schemas.py
import datetime as dt
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict, EmailStr
import json


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool
    class Config:
        from_attributes = True

class RegisterIn(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str = Field(min_length=8)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class MeOut(UserOut): pass

class ResetRequestIn(BaseModel):
    email: EmailStr

class ResetConfirmIn(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


# -------- Athletes --------
class AthleteBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[dt.date] = None
    gender: Optional[str] = None
    sport: Optional[str] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None

    level: Optional[str] = None
    club_team: Optional[str] = None
    mom_name: Optional[str] = None
    dad_name: Optional[str] = None

    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None

    achievements: Optional[str] = None
    practice_frequency: Optional[str] = None
    workout_frequency: Optional[str] = None
    skill_frequency: Optional[str] = None
    development_level: Optional[str] = None
    nutrition_habits: Optional[str] = None
    hydration_habits: Optional[str] = None
    supplements: Optional[str] = None
    sleep_habits: Optional[str] = None

    goal_long_term: Optional[str] = None
    goal_sport_specific: Optional[str] = None
    goal_athlete_specific: Optional[str] = None

    coach_athlete_mentality: Optional[str] = None
    coach_athlete_personality: Optional[str] = None
    coach_prehab_needs: Optional[str] = None
    coach_testing_request: Optional[str] = None
    coach_supplement_requests: Optional[str] = None
    coach_notes: Optional[str] = None

    iq_training_style: Optional[str] = None
    iq_motivation_work_ethic: Optional[str] = None
    iq_learning_preference: Optional[str] = None
    iq_communication_preference: Optional[str] = None

    additional_comments: Optional[str] = None

class AthleteCreate(AthleteBase):
    pass

# --- PATCH (partial update) schema ---
class AthleteUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[dt.date] = None
    gender: Optional[str] = None
    sport: Optional[str] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    level: Optional[str] = None
    club_team: Optional[str] = None
    mom_name: Optional[str] = None
    dad_name: Optional[str] = None
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    achievements: Optional[str] = None
    practice_frequency: Optional[str] = None
    workout_frequency: Optional[str] = None
    skill_frequency: Optional[str] = None
    development_level: Optional[str] = None
    nutrition_habits: Optional[str] = None
    hydration_habits: Optional[str] = None
    supplements: Optional[str] = None
    sleep_habits: Optional[str] = None
    goal_long_term: Optional[str] = None
    goal_sport_specific: Optional[str] = None
    goal_athlete_specific: Optional[str] = None
    coach_athlete_mentality: Optional[str] = None
    coach_athlete_personality: Optional[str] = None
    coach_prehab_needs: Optional[str] = None
    coach_testing_request: Optional[str] = None
    coach_supplement_requests: Optional[str] = None
    coach_notes: Optional[str] = None
    iq_training_style: Optional[str] = None
    iq_motivation_work_ethic: Optional[str] = None
    iq_learning_preference: Optional[str] = None
    iq_communication_preference: Optional[str] = None
    additional_comments: Optional[str] = None


class AthleteOut(AthleteBase):
    id: int
    created_at: dt.datetime
    class Config:
        from_attributes = True

# ---- add this in backend/schemas.py ----
class AthleteUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[dt.date] = None
    gender: Optional[str] = None
    sport: Optional[str] = None
    position: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None

    level: Optional[str] = None
    club_team: Optional[str] = None
    mom_name: Optional[str] = None
    dad_name: Optional[str] = None

    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None

    achievements: Optional[str] = None
    practice_frequency: Optional[str] = None
    workout_frequency: Optional[str] = None
    skill_frequency: Optional[str] = None
    development_level: Optional[str] = None
    nutrition_habits: Optional[str] = None
    hydration_habits: Optional[str] = None
    supplements: Optional[str] = None
    sleep_habits: Optional[str] = None

    goal_long_term: Optional[str] = None
    goal_sport_specific: Optional[str] = None
    goal_athlete_specific: Optional[str] = None

    coach_athlete_mentality: Optional[str] = None
    coach_athlete_personality: Optional[str] = None
    coach_prehab_needs: Optional[str] = None
    coach_testing_request: Optional[str] = None
    coach_supplement_requests: Optional[str] = None
    coach_notes: Optional[str] = None

    iq_training_style: Optional[str] = None
    iq_motivation_work_ethic: Optional[str] = None
    iq_learning_preference: Optional[str] = None
    iq_communication_preference: Optional[str] = None

    additional_comments: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# -------- Assessments --------
class AssessmentCreate(BaseModel):
    athlete_id: int
    date: Optional[dt.date] = None           # ✅ allow real date or null
    age: Optional[int] = None
    weight: Optional[float] = None
    cmf_left: float
    cmf_right: float
    cmp_left: float
    cmp_right: float
    custom_target: Optional[float] = None
    goal: Optional[str] = None
    coach_comment: Optional[str] = None

# ✔ correct type for date + from_attributes for SQLAlchemy

class AssessmentOut(BaseModel):
    id: int
    athlete_id: int
    date: Optional[dt.date] = None           # ✅ THIS LINE fixes your error
    age: Optional[int] = None
    weight: Optional[float] = None
    cmf_left: float
    cmf_right: float
    cmp_left: float
    cmp_right: float
    ratio_left: Optional[float] = None
    ratio_right: Optional[float] = None
    custom_target: Optional[float] = None
    goal: Optional[str] = None
    recommendation_summary: Optional[str] = None
    coach_comment: Optional[str] = None
    created_at: dt.datetime

    model_config = ConfigDict(from_attributes=True)


# -------- Movement --------
class MovementCreate(BaseModel):
    athlete_id: int
    selections_json: Optional[str] = None
    analysis_json: Optional[str] = None
    athlete_comment: Optional[str] = None
    coach_comment: Optional[str] = None

class MovementOut(MovementCreate):
    id: int
    created_at: dt.datetime
    class Config:
        from_attributes = True

# -------- Injuries --------
class InjuryCreate(BaseModel):
    athlete_id: int
    date_reported: Optional[dt.date] = None
    area: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    recovery_plan: Optional[str] = None
    notes: Optional[str] = None
    diagnosis: Optional[str] = None
    mechanism: Optional[str] = None

class InjuryOut(InjuryCreate):
    id: int
    created_at: dt.datetime
    class Config:
        from_attributes = True

# -------- Notes --------
class NoteCreate(BaseModel):
    athlete_id: int
    text: str
    tags: Optional[List[str]] = None
    author: Optional[str] = None

class NoteOut(BaseModel):
    id: int
    athlete_id: int
    text: str
    tags: List[str] = Field(default_factory=list)
    pinned: bool
    author: Optional[str] = None
    created_at: dt.datetime

    # <- This lets us pass DB rows directly; it will parse stringified JSON
    @field_validator("tags", mode="before")
    @classmethod
    def _parse_tags(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                # fallback: comma-separated
                return [s.strip() for s in v.split(",") if s.strip()]
        return []

    model_config = ConfigDict(from_attributes=True)


class PinPatch(BaseModel):
    pinned: bool
