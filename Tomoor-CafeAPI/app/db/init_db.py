from app.db.base import Base
from app.db.session import engine, sessionLocal
from sqlalchemy import inspect, text
from app.core.security import hash_password

from app.features.categories.model import Category
from app.features.products.model import Product, ProductImage
from app.features.sliders.model import Slider
from app.features.admins.model import Admin


def create_tables():
    Base.metadata.create_all(bind=engine)


def migrate_admin_catalog():
    """Apply the additive catalog changes for databases created before v1 admin."""
    inspector = inspect(engine)
    admin_columns = {column["name"] for column in inspector.get_columns("admins")}
    category_columns = {column["name"] for column in inspector.get_columns("categories")}
    product_columns = {column["name"] for column in inspector.get_columns("products")}

    with engine.begin() as connection:
        if "email" not in admin_columns:
            connection.execute(text("ALTER TABLE admins ADD COLUMN email VARCHAR(255)"))
            if "username" in admin_columns:
                connection.execute(text("UPDATE admins SET email = LOWER(username) || '@legacy.eta.local' WHERE email IS NULL"))
            connection.execute(text("ALTER TABLE admins ALTER COLUMN email SET NOT NULL"))
            connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_admins_email ON admins (email)"))
        if "image" not in category_columns:
            connection.execute(text("ALTER TABLE categories ADD COLUMN image VARCHAR(255)"))
        if "is_drink" not in product_columns:
            connection.execute(text("ALTER TABLE products ADD COLUMN is_drink BOOLEAN NOT NULL DEFAULT FALSE"))
        for column in ("small_price", "medium_price", "large_price"):
            if column not in product_columns:
                connection.execute(text(f"ALTER TABLE products ADD COLUMN {column} NUMERIC(10, 2)"))
        connection.execute(text("ALTER TABLE products ALTER COLUMN price DROP NOT NULL"))


def init_db():
    create_tables()
    migrate_admin_catalog()
    with sessionLocal() as db:
        dev_admin = db.query(Admin).filter(Admin.email == "a@gmail.com").first()
        legacy_admin = db.query(Admin).order_by(Admin.id).first()
        if dev_admin is None and legacy_admin is not None:
            legacy_admin.email = "a@gmail.com"
            dev_admin = legacy_admin
        if dev_admin is None:
            dev_admin = Admin(email="a@gmail.com", hashed_password="")
            db.add(dev_admin)
        dev_admin.hashed_password = hash_password("1234")
        db.commit()
