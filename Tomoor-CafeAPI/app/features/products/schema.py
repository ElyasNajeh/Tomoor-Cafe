from pydantic import BaseModel
from decimal import Decimal


class ProductCreate(BaseModel):
    category_id: int
    name_ar: str
    name_en: str
    description_ar: str | None = None
    description_en: str | None = None
    price: Decimal
    image: str


class ProductImageCreate(BaseModel):
    image: str
