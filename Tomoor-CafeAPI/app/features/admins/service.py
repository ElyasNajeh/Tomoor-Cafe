from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core import security
from app.features.admins.model import Admin
from app.features.admins.schema import AdminCreate
from app.shared import crud


def create_admin(db: Session, admin_data: AdminCreate):
    email = str(admin_data.email).lower()
    existing_email = (
        db.query(Admin).filter(Admin.email == email).first()
    )

    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    admin = Admin(
        email=email,
        hashed_password=security.hash_password(admin_data.password),
    )

    return crud.create(db, admin)


def get_admins(db: Session):
    return crud.get_all(db, Admin)


def get_admin(db: Session, admin_id: int):
    admin = crud.get_by_id(db, Admin, admin_id)

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    return admin


def update_admin(db: Session, admin_id: int, admin_data: AdminCreate):
    admin = crud.get_by_id(db, Admin, admin_id)

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    email = str(admin_data.email).lower()
    existing_email = (
        db.query(Admin)
        .filter(
            Admin.email == email,
            Admin.id != admin_id,
        )
        .first()
    )

    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    data = admin_data.model_dump()
    data["email"] = email
    data["hashed_password"] = security.hash_password(data.pop("password"))

    return crud.update_by_id(db, Admin, admin_id, data)


def delete_admin(db: Session, admin_id: int):
    admin = crud.delete_by_id(db, Admin, admin_id)

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    return admin
