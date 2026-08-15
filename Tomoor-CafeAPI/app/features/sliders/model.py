from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from datetime import datetime

from app.db.base import Base


class Slider(Base):
    __tablename__ = "sliders"
    id = Column(Integer, primary_key=True, index=True)
    title_ar = Column(String(255), nullable=False)
    title_en = Column(String(255), nullable=False)
    display_order = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    image = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
