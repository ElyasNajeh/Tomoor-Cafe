from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Numeric,
    Boolean,
    Text,
)
from datetime import datetime

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
    )
    name_ar = Column(String(255), nullable=False)
    name_en = Column(String(255), nullable=False)
    description_ar = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    is_drink = Column(Boolean, default=False, nullable=False)
    price = Column(Numeric(10, 2), nullable=True)
    small_price = Column(Numeric(10, 2), nullable=True)
    medium_price = Column(Numeric(10, 2), nullable=True)
    large_price = Column(Numeric(10, 2), nullable=True)
    is_active = Column(Boolean, default=True)
    image = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    is_active = Column(Boolean, default=True)
    image = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
