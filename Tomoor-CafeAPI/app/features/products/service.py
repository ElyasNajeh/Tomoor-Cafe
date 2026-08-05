from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.shared import crud
from app.features.products.model import Product, ProductImage
from app.features.products.schema import ProductCreate, ProductImageCreate
from app.features.categories.model import Category
from app.shared.images import save_image


def create_product(db: Session, product_data: ProductCreate):
    exist_product = (
        db.query(Product)
        .filter(
            (Product.name_ar == product_data.name_ar)
            | (Product.name_en == product_data.name_en)
        )
        .first()
    )
    if exist_product:
        raise HTTPException(status_code=400, detail="Product already exists")
    exist_category = (
        db.query(Category).filter(Category.id == product_data.category_id).first()
    )
    if not exist_category:
        raise HTTPException(status_code=400, detail="Category not found")
    product = Product(
        category_id=product_data.category_id,
        name_ar=product_data.name_ar,
        name_en=product_data.name_en,
        description_ar=product_data.description_ar,
        description_en=product_data.description_en,
        price=product_data.price,
        image=product_data.image,
    )
    return crud.create(db, product)


def get_products(db: Session):
    return crud.get_all(db, Product)


def get_product(db: Session, product_id: int):
    product = crud.get_by_id(db, Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


def update_product(db: Session, product_id: int, product_data: ProductCreate):
    product = crud.get_by_id(db, Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    exist_product = (
        db.query(Product)
        .filter(
            Product.id != product_id,
            (
                (Product.name_ar == product_data.name_ar)
                | (Product.name_en == product_data.name_en)
            ),
        )
        .first()
    )
    if exist_product:
        raise HTTPException(status_code=400, detail="Product already exists")

    exist_category = (
        db.query(Category).filter(Category.id == product_data.category_id).first()
    )
    if not exist_category:
        raise HTTPException(status_code=400, detail="Category not found")

    updated_product = crud.update_by_id(
        db, Product, product_id, product_data.model_dump()
    )
    return updated_product


def delete_product(db: Session, product_id: int):
    product = crud.delete_by_id(db, Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


def create_product_image(
    db: Session, product_id: int, product_image_data: ProductImageCreate
):
    product = crud.get_by_id(db, Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product_image = ProductImage(product_id=product_id, image=product_image_data.image)
    return crud.create(db, product_image)


def get_products_images(db: Session):
    return crud.get_all(db, ProductImage)


def get_product_images(db: Session, product_id: int):
    product = crud.get_by_id(db, Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return db.query(ProductImage).filter(ProductImage.product_id == product_id).all()


def get_active_product_images(db: Session, product_id: int):

    return (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id, ProductImage.is_active == True)
        .all()
    )


def get_product_image(db: Session, product_image_id: int):
    product_image = crud.get_by_id(db, ProductImage, product_image_id)
    if not product_image:
        raise HTTPException(status_code=404, detail="Product Image not found")

    return product_image


def update_product_image(
    db: Session, product_image_id: int, product_image_data: ProductImageCreate
):
    product_image = crud.get_by_id(db, ProductImage, product_image_id)
    if not product_image:
        raise HTTPException(status_code=404, detail="Product Image not found")

    updated_product_image = crud.update_by_id(
        db, ProductImage, product_image_id, product_image_data.model_dump()
    )
    return updated_product_image


def delete_product_image(db: Session, product_image_id: int):
    product_image = crud.delete_by_id(db, ProductImage, product_image_id)
    if not product_image:
        raise HTTPException(status_code=404, detail="Product Image not found")

    return product_image


def toggle_product_status(db: Session, product_id: int):

    product = crud.get_by_id(db, Product, product_id)

    if not product:

        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = not product.is_active

    db.commit()

    db.refresh(product)

    return product


def upload_image(file: UploadFile):
    return save_image(file, "products")


def toggle_product_image(db: Session, product_image_id: int):
    product_image = crud.get_by_id(db, ProductImage, product_image_id)

    if not product_image:

        raise HTTPException(status_code=404, detail="Product Image not found")

    product_image.is_active = not product_image.is_active

    db.commit()

    db.refresh(product_image)

    return product_image
