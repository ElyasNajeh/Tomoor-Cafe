from pydantic import BaseModel, field_validator


class CategoryCreate(BaseModel):
    name_ar: str
    name_en: str
    image: str

    @field_validator("name_ar", "name_en", "image")
    @classmethod
    def required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required")
        return value
