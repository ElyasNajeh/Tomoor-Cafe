from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.features.categories.model import Category
from app.features.products.model import Drink, Food, Product, ProductType
from app.features.products.schema import ProductCreate
from app.shared import crud
from app.shared.images import save_image


def _apply_product_data(product: Product, product_data: ProductCreate) -> None:
    values = product_data.model_dump(exclude={"food", "drink"})
    for field, value in values.items():
        setattr(product, field, value)

    if product_data.product_type == ProductType.FOOD:
        product.drink = None
        if product.food is None:
            product.food = Food()
        product.food.price = product_data.food.price
    else:
        product.food = None
        if product.drink is None:
            product.drink = Drink()
        for field, value in product_data.drink.model_dump().items():
            setattr(product.drink, field, value)


def create_product(db: Session, product_data: ProductCreate):
    exist_product = db.query(Product).filter(
        (Product.name_ar == product_data.name_ar)
        | (Product.name_en == product_data.name_en)
    ).first()
    if exist_product:
        raise HTTPException(status_code=400, detail="Product already exists")

    category = db.query(Category).filter(Category.id == product_data.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")

    product = Product()
    _apply_product_data(product, product_data)
    if not category.is_active:
        product.is_active = False
    return crud.create(db, product)


def get_products(
    db: Session, page: int, limit: int, search: str | None,
    category_id: int | None, is_active: bool | None,
):
    query = db.query(Product)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter((Product.name_ar.ilike(term)) | (Product.name_en.ilike(term)))
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    total = query.count()
    items = query.order_by(Product.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "items": items, "page": page, "limit": limit, "total_items": total,
        "total_pages": max(1, (total + limit - 1) // limit),
    }


def get_product(db: Session, product_id: int):
    product = crud.get_by_id(db, Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def update_product(db: Session, product_id: int, product_data: ProductCreate):
    product = crud.get_by_id(db, Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    duplicate = db.query(Product).filter(
        Product.id != product_id,
        (Product.name_ar == product_data.name_ar) | (Product.name_en == product_data.name_en),
    ).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="Product already exists")

    category = db.query(Category).filter(Category.id == product_data.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")

    _apply_product_data(product, product_data)
    if not category.is_active:
        product.is_active = False
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int):
    product = crud.delete_by_id(db, Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def toggle_product_status(db: Session, product_id: int):
    product = crud.get_by_id(db, Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product.is_active:
        category = crud.get_by_id(db, Category, product.category_id)
        if not category or not category.is_active:
            raise HTTPException(
                status_code=409,
                detail="Activate the category before activating this product",
            )

    product.is_active = not product.is_active
    db.commit()
    db.refresh(product)
    return product


def upload_image(file: UploadFile):
    return save_image(file, "products")
