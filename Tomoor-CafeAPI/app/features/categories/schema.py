from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name_ar: str
    name_en: str
