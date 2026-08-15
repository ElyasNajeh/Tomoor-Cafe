from sqlalchemy.orm import Session

from app.features.products.model import Product
from app.features.categories.model import Category
from app.features.sliders.model import Slider


def get_dashboard_stats(db: Session):

    products_count = db.query(Product).count()

    categories_count = db.query(Category).count()

    sliders_count = db.query(Slider).count()

    return {
        "products": products_count,
        "categories": categories_count,
        "sliders": sliders_count,
    }
