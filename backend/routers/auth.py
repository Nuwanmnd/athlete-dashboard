# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from uuid import uuid4
from email.mime.text import MIMEText
from typing import Optional
import os
import smtplib

from ..database import get_db
from .. import models, schemas
from ..security import hash_password, verify_password, create_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])

# -----------------------------
# Config
# -----------------------------
COOKIE_NAME = "access_token"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "0") == "1"  # set to "1" in production (HTTPS)
ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 7  # 7 days

# Comma-separated allow-list, e.g. "you@example.com,client@example.com"
ALLOWED_LOGIN_EMAILS = {
    e.strip().lower()
    for e in os.getenv("ALLOWED_LOGIN_EMAILS", "").split(",")
    if e.strip()
}

# Registration is disabled by default; flip to "1" only if you truly need to create users through API.
ENABLE_REGISTER = os.getenv("ENABLE_REGISTER", "0") == "1"


# -----------------------------
# Email (Password Reset)
# -----------------------------
def send_reset_email(to_email: str, reset_url: str):
    """
    Minimal SMTP sender. If SMTP env vars are missing, print link to console (dev mode).
    Required envs for SMTP:
      - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, (optional) SMTP_FROM
    """
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "0") or 0)
    user = os.getenv("SMTP_USER")
    pwd = os.getenv("SMTP_PASS")
    sender = os.getenv("SMTP_FROM", user or "no-reply@example.com")

    body = f"Click to reset your password:\n\n{reset_url}\n\nThis link expires in 30 minutes."
    msg = MIMEText(body)
    msg["Subject"] = "Password reset"
    msg["From"] = sender
    msg["To"] = to_email

    if not (host and port and user and pwd):
        print(f"[DEV] Reset link for {to_email}: {reset_url}")
        return

    with smtplib.SMTP_SSL(host, port) as server:
        server.login(user, pwd)
        server.sendmail(sender, [to_email], msg.as_string())


# -----------------------------
# Cookie helpers
# -----------------------------
def set_auth_cookie(resp: Response, token: str):
    resp.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        max_age=ACCESS_TOKEN_MAX_AGE,
        path="/",
    )


def clear_auth_cookie(resp: Response):
    resp.delete_cookie(COOKIE_NAME, path="/")


def current_user(request: Request, db: Session) -> Optional[models.User]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    try:
        payload = decode_token(token)
        uid = payload.get("sub")
        if not uid:
            return None
        return db.query(models.User).get(int(uid))
    except Exception:
        return None


# -----------------------------
# Routes
# -----------------------------
@router.post("/register", response_model=schemas.UserOut)
def register(payload: schemas.RegisterIn, db: Session = Depends(get_db)):
    """
    Registration is OFF by default.
    If you enable it (ENABLE_REGISTER=1), it still enforces the allow-list:
    only emails in ALLOWED_LOGIN_EMAILS can be registered.
    """
    if not ENABLE_REGISTER:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    if ALLOWED_LOGIN_EMAILS and payload.email.lower() not in ALLOWED_LOGIN_EMAILS:
        raise HTTPException(status_code=403, detail="Registration not allowed for this email")

    exists = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    u = models.User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role="owner",
        is_active=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@router.post("/login", response_model=schemas.UserOut)
def login(payload: schemas.LoginIn, response: Response, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.email == payload.email.lower()).first()

    # Enforce "only two can log" (or however many you list) via allow-list
    if ALLOWED_LOGIN_EMAILS and (not u or u.email.lower() not in ALLOWED_LOGIN_EMAILS):
        # Do not reveal whether user exists
        raise HTTPException(status_code=403, detail="Login not allowed for this account")

    if not u or not verify_password(payload.password, u.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email/password")

    token = create_token({"sub": str(u.id)})
    set_auth_cookie(response, token)
    return schemas.UserOut.model_validate(u)


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=schemas.MeOut)
def me(request: Request, db: Session = Depends(get_db)):
    u = current_user(request, db)
    if not u:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return u


@router.post("/request-reset")
def request_reset(payload: schemas.ResetRequestIn, db: Session = Depends(get_db)):
    # Always respond OK (don’t reveal emails)
    u = db.query(models.User).filter(models.User.email == payload.email.lower()).first()

    # Optional: also gate reset by allow-list, so random emails can’t probe for tokens
    if ALLOWED_LOGIN_EMAILS and (not u or u.email.lower() not in ALLOWED_LOGIN_EMAILS):
        return {"ok": True}

    if u:
        token = uuid4().hex
        u.reset_token = token
        u.reset_expires = datetime.utcnow() + timedelta(minutes=30)
        db.commit()

        app_url = os.getenv("APP_URL", "http://localhost:5173")
        reset_url = f"{app_url}/reset-password?token={token}"
        send_reset_email(u.email, reset_url)

    return {"ok": True}


@router.post("/reset")
def confirm_reset(payload: schemas.ResetConfirmIn, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.reset_token == payload.token).first()
    if not u or not u.reset_expires or u.reset_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Optional: still enforce allow-list for safety
    if ALLOWED_LOGIN_EMAILS and u.email.lower() not in ALLOWED_LOGIN_EMAILS:
        raise HTTPException(status_code=403, detail="Not allowed")

    u.password_hash = hash_password(payload.new_password)
    u.reset_token = None
    u.reset_expires = None
    db.commit()
    return {"ok": True}
