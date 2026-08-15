from datetime import datetime
from enum import Enum as PythonEnum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class ProductType(str, PythonEnum):
    FOOD = "FOOD"
    DRINK = "DRINK"


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
    image = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    product_type = Column(Enum(ProductType, name="product_type"), nullable=False)

    food = relationship(
        "Food", back_populates="product", uselist=False,
        cascade="all, delete-orphan", lazy="joined", single_parent=True,
    )
    drink = relationship(
        "Drink", back_populates="product", uselist=False,
        cascade="all, delete-orphan", lazy="joined", single_parent=True,
    )


class Food(Base):
    __tablename__ = "foods"

    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    )
    price = Column(Numeric(10, 2), nullable=False)

    product = relationship("Product", back_populates="food")


class Drink(Base):
    __tablename__ = "drinks"

    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    )
    small_price = Column(Numeric(10, 2), nullable=True)
    medium_price = Column(Numeric(10, 2), nullable=True)
    large_price = Column(Numeric(10, 2), nullable=True)

    product = relationship("Product", back_populates="drink")
