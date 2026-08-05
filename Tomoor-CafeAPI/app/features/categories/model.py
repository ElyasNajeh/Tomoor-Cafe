from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name_ar = Column(String(255), nullable=False, unique=True)
    name_en = Column(String(255), nullable=False, unique=True)
    image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
