from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.auth.schema import LoginRequest
from app.features.auth import service
from app.features.admins.model import Admin
from app.features.admins.schema import AdminPublic

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    return service.login(db, login_data, response)


@router.post("/refresh")
def refresh_access_token(request: Request, response: Response, db: Session = Depends(get_db)):
    return service.refresh_access_token(db, request, response)


@router.post("/logout")
def logout(response: Response):
    return service.logout(response)


@router.get("/me", response_model=AdminPublic)
def get_me(
    current_user: Admin = Depends(get_current_user),
):
    return current_user
