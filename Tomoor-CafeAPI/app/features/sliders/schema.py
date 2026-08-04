from pydantic import BaseModel


class SliderCreate(BaseModel):
    title_ar: str
    title_en: str
    display_order: int = 0
    image: str
