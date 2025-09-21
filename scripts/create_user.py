# scripts/create_user.py
import sys
from pathlib import Path

# Ensure project root is on the path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.database import SessionLocal
from backend.security import hash_password
from backend import models

import argparse

def main():
    p = argparse.ArgumentParser()
    p.add_argument("full_name")
    p.add_argument("email")
    p.add_argument("password")
    args = p.parse_args()

    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == args.email.lower()).first()
        if existing:
            print("User already exists.")
            return
        user = models.User(
            full_name=args.full_name,
            email=args.email.lower(),
            password_hash=hash_password(args.password),
            role="owner",
            is_active=True,
        )
        db.add(user)
        db.commit()
        print("User created.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
