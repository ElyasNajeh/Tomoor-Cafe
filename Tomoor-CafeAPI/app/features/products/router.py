from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.features.products import service
from app.features.products.schema import ProductCreate, ProductImageCreate

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    return service.upload_image(file)


@router.post("/")
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_product(db, product_data)


@router.get("/")
def get_products(
    page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100),
    search: str | None = Query(None, max_length=255), category_id: int | None = Query(None, ge=1),
    is_active: bool | None = None, db: Session = Depends(get_db),
):
    return service.get_products(db, page, limit, search, category_id, is_active)


@router.get("/images")
def get_products_images(
    db: Session = Depends(get_db),
):
    return service.get_products_images(db)


@router.get("/images/{product_image_id}")
def get_product_image(product_image_id: int, db: Session = Depends(get_db)):
    return service.get_product_image(db, product_image_id)


@router.put("/images/{product_image_id}")
def update_product_image(
    product_image_data: ProductImageCreate,
    product_image_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_product_image(db, product_image_id, product_image_data)


@router.delete("/images/{product_image_id}")
def delete_product_image(
    product_image_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_product_image(db, product_image_id)


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    return service.get_product(db, product_id)


@router.put("/{product_id}")
def update_product(
    product_data: ProductCreate,
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_product(db, product_id, product_data)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_product(db, product_id)


@router.post("/{product_id}/images")
def create_product_image(
    product_image_data: ProductImageCreate,
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_product_image(db, product_id, product_image_data)


@router.get("/{product_id}/images")
def get_product_images(product_id: int, db: Session = Depends(get_db)):
    return service.get_product_images(db, product_id)


@router.get("/{product_id}/activeimages")
def get_active_product_images(product_id: int, db: Session = Depends(get_db)):
    return service.get_active_product_images(db, product_id)


@router.patch("/{product_id}/toggle-status")
def toggle_product_status(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.toggle_product_status(db, product_id)


@router.patch("/images/{product_image_id}/toggle")
def toggle_product_image(
    product_image_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.toggle_product_image(db, product_image_id)


