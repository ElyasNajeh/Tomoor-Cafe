from pydantic import BaseModel, field_validator

from app.shared.images import validate_webp_url


class SliderCreate(BaseModel):
    title_ar: str
    title_en: str
    display_order: int = 0
    is_active: bool = True
    image: str

    @field_validator("image")
    @classmethod
    def processed_image(cls, value: str) -> str:
        return validate_webp_url(value)
