from app.db.base import Base
from app.db.session import engine

from app.features.categories.model import Category
from app.features.products.model import Product, ProductImage
from app.features.sliders.model import Slider
from app.features.admins.model import Admin


def create_tables():
    Base.metadata.create_all(bind=engine)


def init_db():
    create_tables()
