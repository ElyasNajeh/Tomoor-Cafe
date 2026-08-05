from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.features.admins import service
from app.features.admins.schema import AdminCreate, AdminPublic

router = APIRouter(prefix="/admins", tags=["Admins"])


@router.post("/", response_model=AdminPublic)
def create_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_admin(db, admin_data)


@router.get("/", response_model=list[AdminPublic])
def get_admins(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.get_admins(db)


@router.get("/{admin_id}", response_model=AdminPublic)
def get_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.get_admin(db, admin_id)


@router.put("/{admin_id}", response_model=AdminPublic)
def update_admin(
    admin_data: AdminCreate,
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_admin(db, admin_id, admin_data)


@router.delete("/{admin_id}", response_model=AdminPublic)
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_admin(db, admin_id)
