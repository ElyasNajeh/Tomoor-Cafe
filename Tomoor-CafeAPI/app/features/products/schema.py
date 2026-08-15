from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

from app.features.products.model import ProductType


class FoodData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    price: Decimal

    @field_validator("price")
    @classmethod
    def positive_price(cls, value: Decimal) -> Decimal:
        if value <= 0:
            raise ValueError("Prices must be greater than zero")
        return value


class DrinkData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    small_price: Decimal | None = None
    medium_price: Decimal | None = None
    large_price: Decimal | None = None

    @field_validator("small_price", "medium_price", "large_price")
    @classmethod
    def positive_price(cls, value: Decimal | None) -> Decimal | None:
        if value is not None and value <= 0:
            raise ValueError("Prices must be greater than zero")
        return value

    @model_validator(mode="after")
    def require_a_price(self):
        if not any(
            value is not None
            for value in (self.small_price, self.medium_price, self.large_price)
        ):
            raise ValueError("Drink products require at least one size price")
        return self


class ProductCreate(BaseModel):
    category_id: int
    name_ar: str
    name_en: str
    description_ar: str | None = None
    description_en: str | None = None
    image: str
    is_active: bool = True
    product_type: ProductType
    food: FoodData | None = None
    drink: DrinkData | None = None

    @field_validator("name_ar", "name_en", "image")
    @classmethod
    def required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required")
        return value

    @model_validator(mode="after")
    def validate_pricing(self):
        if self.product_type == ProductType.FOOD:
            if self.food is None or self.drink is not None:
                raise ValueError("Food products require food pricing only")
        elif self.drink is None or self.food is not None:
            raise ValueError("Drink products require drink pricing only")
        return self


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    name_ar: str
    name_en: str
    description_ar: str | None
    description_en: str | None
    image: str
    is_active: bool
    created_at: datetime
    product_type: ProductType
    food: FoodData | None
    drink: DrinkData | None


class ProductPage(BaseModel):
    items: list[ProductResponse]
    page: int
    limit: int
    total_items: int
    total_pages: int
