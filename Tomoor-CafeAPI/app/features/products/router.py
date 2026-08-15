from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.products import service
from app.features.products.schema import ProductCreate, ProductPage, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    return service.upload_image(file)


@router.post("/", response_model=ProductResponse)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_product(db, product_data)


@router.get("/", response_model=ProductPage)
def get_products(
    page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100),
    search: str | None = Query(None, max_length=255),
    category_id: int | None = Query(None, ge=1),
    is_active: bool | None = None, db: Session = Depends(get_db),
):
    return service.get_products(db, page, limit, search, category_id, is_active)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return service.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_data: ProductCreate,
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_product(db, product_id, product_data)


@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_product(db, product_id)


@router.patch("/{product_id}/toggle-status", response_model=ProductResponse)
def toggle_product_status(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.toggle_product_status(db, product_id)
