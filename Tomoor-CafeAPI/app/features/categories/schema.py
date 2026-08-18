from pydantic import BaseModel, field_validator

from app.shared.images import validate_webp_url


class CategoryCreate(BaseModel):
    name_ar: str
    name_en: str
    image: str
    is_active: bool = True

    @field_validator("name_ar", "name_en", "image")
    @classmethod
    def required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required")
        return value

    @field_validator("image")
    @classmethod
    def processed_image(cls, value: str) -> str:
        return validate_webp_url(value)
