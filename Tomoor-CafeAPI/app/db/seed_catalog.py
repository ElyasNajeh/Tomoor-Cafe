from pathlib import Path
from random import Random
from shutil import copyfile

from sqlalchemy.orm import Session

from app.core.config import settings
from app.features.categories.model import Category
from app.features.products.model import Product


CATALOG = [
    ("Smoothie", "سموذي", True, [("Paradise", "سموذي براداييس"), ("Strawberry Banana", "فراولة وموز"), ("Cherry", "كرز")]),
    ("Refreshers", "ريفريشر", True, [("Exotic Green", "تفاح أخضر"), ("Strawberry", "فراولة"), ("Iced Tea", "آيس تي")]),
    ("Frosted Drinks", "فروستد درينكس", True, [("Frosted French Vanilla", "فروستد فرنش فانيلا"), ("Frosted Mocha", "فروستد موكا"), ("Frosted Salted Caramel", "فروستد سولتد كراميل")]),
    ("Matcha", "ماتشا", True, [("Iced Matcha", "آيس ماتشا"), ("Strawberry Gold Foam Matcha", "ماتشا بالفراولة مع جولد فوم"), ("Mango Gold Foam Matcha", "ماتشا بالمانجو مع جولد فوم")]),
    ("Special Drinks", "مشاريب خاصة", True, [("Hot Chocolate", "هوت تشوكليت"), ("Coconut Hot Chocolate", "هوت تشوكليت بجوز الهند"), ("Hot Hazelnut", "هوت بندق")]),
    ("Sweet Coffee", "قهوة سويت", True, [("Iced Spanish Latte", "آيس سبانيش لاتيه"), ("Iced Pistachio Latte", "آيس فستق حلبي لاتيه"), ("Iced Caramel Macchiato", "آيس مكياتو كراميل")]),
    ("Milk Coffee", "قهوة حليب", True, [("Cappuccino", "كابتشينو"), ("Pistachio Latte", "لاتيه فستق حلبي"), ("Mocha", "موكا")]),
    ("Sandwiches", "ساندويش", False, [("Club Sandwich", "كلوب ساندويش"), ("Omelette Sandwich", "ساندويش أومليت"), ("Feta Bagels", "بيجل جبنة فيتا")]),
    ("Cookies", "كوكيز", False, [("Chocolate Chips", "كوكيز شوكولاتة تشيبس"), ("Kinder Cookies", "كوكيز كيندر"), ("Mini Jozeyah", "ميني جوزية")]),
    ("Sugar-Free Desserts", "حلويات خالية من السكر", False, [("Carrot English Cake", "كيك إنجليزي بالجزر خالي من السكر"), ("Mini Brownies Sugar Free", "ميني براونيز خالي من السكر"), ("Sugar-Free Vanilla Muffin", "مافن فانيلا خالي من السكر")]),
    ("Cakes", "كيك", False, [("Brownie", "براوني"), ("San Sebastian Cake", "كيك سان سباستيان"), ("Italian Tiramisu", "تيراميسو إيطالي")]),
    ("Baked Goods", "المخبوزات", False, [("Spinach Fatayer", "فطائر سبانخ"), ("Cheese and Za'atar", "جبنة وزعتر"), ("Mixed Cheese Pastry", "معجنات جبنة مشكلة")]),
]


def _install_seed_images() -> tuple[str, str]:
    source_dirs = [Path("/app/seed-assets"), Path(__file__).resolve().parents[3] / "Tomoor-CafeUI" / "src" / "assets"]
    source_dir = next((path for path in source_dirs if (path / "drink-image.jpg").is_file()), None)
    if source_dir is None:
        raise RuntimeError("Catalog seed images were not found")

    target_dir = Path(settings.UPLOAD_DIR).resolve() / "seed"
    target_dir.mkdir(parents=True, exist_ok=True)
    for filename in ("drink-image.jpg", "food-image.jpg"):
        target = target_dir / filename
        if not target.exists():
            copyfile(source_dir / filename, target)
    return "/uploads/seed/drink-image.jpg", "/uploads/seed/food-image.jpg"


def seed_catalog(db: Session) -> None:
    drink_image, food_image = _install_seed_images()
    snack_prices = Random(20260805)

    for name_en, name_ar, is_drink, products in CATALOG:
        image = drink_image if is_drink else food_image
        category = db.query(Category).filter(Category.name_en == name_en).first()
        if category is None:
            category = Category(name_en=name_en, name_ar=name_ar, image=image)
            db.add(category)
            db.flush()

        for product_en, product_ar in products:
            exists = db.query(Product).filter(Product.category_id == category.id, Product.name_en == product_en).first()
            if exists is not None:
                continue
            product = Product(
                category_id=category.id,
                name_en=product_en,
                name_ar=product_ar,
                is_drink=is_drink,
                is_active=True,
                image=image,
            )
            if is_drink:
                product.small_price = 12
                product.medium_price = 14
                product.large_price = 16
            else:
                product.price = snack_prices.choice((5, 10, 15, 20, 25))
            db.add(product)

