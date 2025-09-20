from backend.database import SessionLocal
from backend import models
from datetime import date
import json

def seed():
    db = SessionLocal()
    try:
        a = models.Athlete(
            first_name="Alex",
            last_name="Taylor",
            date_of_birth=date(2010, 5, 12),
            gender="male",
            sport="Basketball",
            position="Guard",
            city="Austin",
            level="High School",
        )
        db.add(a); db.commit(); db.refresh(a)

        db.add(models.Assessment(
            athlete_id=a.id, date=date.today(),
            age=14, weight=145,
            cmf_left=800, cmf_right=790, cmp_left=600, cmp_right=590,
            goal="improve_explosiveness",
        ))

        db.add(models.MovementAssessment(
            athlete_id=a.id,
            selections_json='{"Squat Test":["Knee Valgus"]}',
            analysis_json='{"over":["Adductor Magnus"],"under":["Glute Med"]}',
        ))

        db.add(models.Injury(
            athlete_id=a.id, date_reported=date.today(),
            area="Left Ankle", severity="Moderate", status="Active",
            recovery_plan="RICE 48h", notes="Rolled ankle in practice",
        ))

        db.add(models.Note(
            athlete_id=a.id,
            text="Great energy today. Focus on soft landings.",
            tags=json.dumps(["plyo", "landing"]),
            pinned=True,
            author="Coach",
        ))

        db.commit()
        print("Seeded mock data.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
