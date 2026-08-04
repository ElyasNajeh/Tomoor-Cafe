from fastapi import HTTPException, Response, Request
from sqlalchemy.orm import Session
from datetime import timedelta

from app.features.admins.model import Admin
from app.features.auth.schema import LoginRequest
from app.core.security import verify_password, create_token, verify_token
from app.core.config import settings


def login(db: Session, login_data: LoginRequest, response: Response):
    found_user = db.query(Admin).filter(Admin.email == login_data.email).first()
    if not found_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    is_correct = verify_password(login_data.password, found_user.hashed_password)
    if not is_correct:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_token(
        {"sub": found_user.email},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_token(
        {"sub": found_user.email}, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "username": found_user.username,
    }


def refresh_access_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    email = verify_token(refresh_token)
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    new_access_token = create_token(
        {"sub": email},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {"access_token": new_access_token, "token_type": "bearer"}


def logout(response: Response):
    response.delete_cookie(key="access_token", samesite="strict", secure=False)

    response.delete_cookie(key="refresh_token", samesite="strict", secure=False)

    return {"message": "Logged out successfully"}
