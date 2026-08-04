from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.categories import service
from app.features.categories.schema import CategoryCreate

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/")
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_category(db, category_data)


@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    return service.get_categories(db)


@router.get("/{category_id}")
def get_category(category_id: int, db: Session = Depends(get_db)):
    return service.get_category(db, category_id)


@router.put("/{category_id}")
def update_category(
    category_data: CategoryCreate,
    category_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_category(db, category_id, category_data)


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_category(db, category_id)
