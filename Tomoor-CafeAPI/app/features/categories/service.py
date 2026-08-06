from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.shared import crud
from app.features.categories.model import Category
from app.features.categories.schema import CategoryCreate
from app.features.products.model import Product
from app.shared.images import save_image


def upload_image(file: UploadFile):
    return save_image(file, "categories")


def create_category(db: Session, category_data: CategoryCreate):
    exist_category = (
        db.query(Category)
        .filter(
            (Category.name_ar == category_data.name_ar)
            | (Category.name_en == category_data.name_en)
        )
        .first()
    )
    if exist_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    category = Category(**category_data.model_dump())
    return crud.create(db, category)


def get_categories(
    db: Session,
    page: int,
    limit: int,
    search: str | None,
    is_active: bool | None,
):
    query = db.query(Category)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter((Category.name_ar.ilike(term)) | (Category.name_en.ilike(term)))
    if is_active is not None:
        query = query.filter(Category.is_active == is_active)
    total = query.count()
    items = query.order_by(Category.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {"items": items, "page": page, "limit": limit, "total_items": total,
            "total_pages": max(1, (total + limit - 1) // limit)}


def get_category(db: Session, category_id: int):
    category = crud.get_by_id(db, Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


def update_category(db: Session, category_id: int, category_data: CategoryCreate):
    category = crud.get_by_id(db, Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    exist_category = (
        db.query(Category)
        .filter(
            Category.id != category_id,
            (
                (Category.name_ar == category_data.name_ar)
                | (Category.name_en == category_data.name_en)
            ),
        )
        .first()
    )
    if exist_category:
        raise HTTPException(status_code=400, detail="Category already exists")

    for field, value in category_data.model_dump().items():
        setattr(category, field, value)

    if not category.is_active:
        _hide_category_products(db, category.id)

    try:
        db.commit()
        db.refresh(category)
        return category
    except Exception:
        db.rollback()
        raise


def delete_category(db: Session, category_id: int):
    try:
        category = crud.delete_by_id(db, Category, category_id)
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Category cannot be deleted while it contains products",
        )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


def toggle_category_status(db: Session, category_id: int):
    category = crud.get_by_id(db, Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.is_active = not category.is_active
    if not category.is_active:
        _hide_category_products(db, category.id)

    try:
        db.commit()
        db.refresh(category)
        return category
    except Exception:
        db.rollback()
        raise


def _hide_category_products(db: Session, category_id: int):
    db.query(Product).filter(
        Product.category_id == category_id,
        Product.is_active.is_(True),
    ).update({Product.is_active: False}, synchronize_session=False)
