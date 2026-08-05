from pydantic import BaseModel, field_validator, model_validator
from decimal import Decimal


class ProductCreate(BaseModel):
    category_id: int
    name_ar: str
    name_en: str
    description_ar: str | None = None
    description_en: str | None = None
    is_drink: bool = False
    is_active: bool = True
    price: Decimal | None = None
    small_price: Decimal | None = None
    medium_price: Decimal | None = None
    large_price: Decimal | None = None
    image: str

    @field_validator("name_ar", "name_en", "image")
    @classmethod
    def required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required")
        return value

    @field_validator("price", "small_price", "medium_price", "large_price")
    @classmethod
    def positive_price(cls, value: Decimal | None) -> Decimal | None:
        if value is not None and value <= 0:
            raise ValueError("Prices must be greater than zero")
        return value

    @model_validator(mode="after")
    def validate_pricing(self):
        size_prices = (self.small_price, self.medium_price, self.large_price)
        if self.is_drink:
            if not any(value is not None for value in size_prices):
                raise ValueError("Drink products require at least one size price")
            if self.price is not None:
                raise ValueError("Drink products cannot use a single price")
        else:
            if self.price is None:
                raise ValueError("Non-drink products require a price")
            if any(value is not None for value in size_prices):
                raise ValueError("Non-drink products cannot use size prices")
        return self


class ProductImageCreate(BaseModel):
    image: str
