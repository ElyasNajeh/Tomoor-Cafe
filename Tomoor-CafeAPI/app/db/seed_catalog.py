from pathlib import Path
from random import Random
from re import sub
from shutil import copyfile

from sqlalchemy.orm import Session

from app.core.config import settings
from app.features.categories.model import Category
from app.features.products.model import Drink, Food, Product, ProductType
from app.features.sliders.model import Slider


CATEGORIES = [
    {
        "folder": "Cold Lattes", "name_en": "Cold Lattes", "name_ar": "لاتيه بارد",
        "type": ProductType.DRINK, "cover": "iced-spanish-latte.jpg",
        "slider_en": "iced latte", "slider_ar": "لاتيه بارد وكريمي",
        "products": [
            ("ice-latte.jpg", "Classic Iced Latte", "آيس لاتيه كلاسيك", "Smooth espresso and chilled milk over ice.", "إسبريسو ناعم وحليب بارد مع الثلج."),
            ("iced caramel.jpg", "Iced Caramel Latte", "آيس لاتيه كراميل", "Chilled latte with a rich caramel finish.", "لاتيه بارد بلمسة كراميل غنية."),
            ("iced-spanish-latte.jpg", "Iced Spanish Latte", "آيس سبانيش لاتيه", "Sweet, creamy milk balanced with bold espresso.", "حليب حلو وكريمي مع إسبريسو غني."),
            ("latte.jpg", "House Iced Latte", "آيس لاتيه الدار", "Our refreshing signature espresso and milk blend.", "خلطة منعشة من الإسبريسو والحليب على طريقتنا."),
            ("vanilla late.jpg", "Iced Vanilla Latte", "آيس فانيلا لاتيه", "Velvety iced latte scented with vanilla.", "لاتيه بارد مخملي بنكهة الفانيلا."),
        ],
    },
    {
        "folder": "Desserts", "name_en": "Desserts", "name_ar": "حلويات",
        "type": ProductType.FOOD, "cover": "Dessert_Category.jpg",
        "slider_en": "A sweet momen", "slider_ar": "لحظة حلوة",
        "products": [
            ("almond butter.jpg", "Almond Butter Slice", "قطعة زبدة اللوز", "A soft nutty slice with creamy almond butter.", "قطعة طرية بنكهة المكسرات وزبدة اللوز الكريمية."),
            ("cake.jpg", "Chocolate Celebration Cake", "كيكة شوكولاتة فاخرة", "Rich chocolate cake with a smooth cocoa finish.", "كيكة شوكولاتة غنية بلمسة كاكاو ناعمة."),
            ("codex put a name for it.jpg", "Classic Tiramisu", "تيراميسو كلاسيك", "Coffee-soaked layers with mascarpone and cocoa.", "طبقات بالقهوة والماسكربوني والكاكاو."),
            ("Dessert_Category.jpg", "Tomoor Dessert Selection", "تشكيلة حلويات تمور", "A hand-picked assortment of our favorite sweets.", "تشكيلة مختارة من حلوياتنا المفضلة."),
            ("fancy dessert.jpg", "Pistachio Cream Delight", "حلى كريمة الفستق", "Silky cream dessert finished with pistachio.", "حلى كريمي ناعم مزين بالفستق."),
            ("fluffy cream.jpg", "Fluffy Vanilla Cloud", "سحابة الفانيلا", "Light vanilla cream with an airy, delicate texture.", "كريمة فانيلا خفيفة بقوام هش ولطيف."),
            ("french dessert.jpg", "French Chocolate Mousse", "موس الشوكولاتة الفرنسي", "Airy dark chocolate mousse with deep cocoa flavor.", "موس شوكولاتة داكنة خفيف بنكهة كاكاو غنية."),
            ("mini sweets.jpg", "Mini Sweet Bites", "لقيمات حلوة صغيرة", "An assorted box of bite-sized treats.", "تشكيلة من الحلويات الصغيرة اللذيذة."),
            ("oreo dessert.jpg", "Oreo Cream Cup", "كوب كريمة أوريو", "Creamy layered dessert packed with Oreo crumbs.", "حلى كريمي بطبقات غنية بفتات الأوريو."),
            ("oreo truffles.jpg", "Oreo Chocolate Truffles", "كرات أوريو بالشوكولاتة", "Bite-sized Oreo truffles coated in chocolate.", "كرات أوريو صغيرة مغطاة بالشوكولاتة."),
        ],
    },
    {
        "folder": "Espresso", "name_en": "Espresso", "name_ar": "إسبريسو",
        "type": ProductType.DRINK, "cover": "category.jpg",
        "slider_en": "Bold espresso", "slider_ar": "إسبريسو",
        "products": [
            ("category.jpg", "House Espresso", "إسبريسو الدار", "Our balanced signature espresso with a rich crema.", "إسبريسو متوازن بطبقة كريما غنية."),
            ("espresso double.jpg", "Double Espresso", "دبل إسبريسو", "Two bold shots for a deep, full coffee flavor.", "جرعتان مركزتان لنكهة قهوة قوية ومتكاملة."),
            ("singlle.jpg", "Single Espresso", "سنجل إسبريسو", "A classic aromatic shot with a smooth finish.", "جرعة إسبريسو عطرية كلاسيكية بنهاية ناعمة."),
        ],
    },
    {
        "folder": "Fresh_Drinks", "name_en": "Fresh Drinks", "name_ar": "مشروبات طازجة",
        "type": ProductType.DRINK, "cover": "category.jpg",
        "slider_en": "Fresh fruit", "slider_ar": "فاكهة طازجة",
        "products": [
            ("category.jpg", "Fresh Fruit Medley", "مزيج الفواكه الطازجة", "A bright seasonal blend of freshly prepared fruits.", "مزيج موسمي منعش من الفواكه الطازجة."),
            ("kiwi.jpg", "Fresh Kiwi", "كيوي طازج", "Tangy kiwi blended into a vibrant cooler.", "كيوي منعش ممزوج في مشروب نابض بالنكهة."),
            ("mango.jpg", "Fresh Mango", "مانجا طازجة", "Naturally sweet mango, smooth and refreshing.", "مانجا حلوة بطبيعتها بقوام ناعم ومنعش."),
            ("orange.jpg", "Fresh Orange", "برتقال طازج", "Freshly squeezed orange with lively citrus flavor.", "برتقال معصور طازجاً بنكهة حمضية منعشة."),
            ("pashion fruit.jpg", "Passion Fruit Cooler", "مشروب باشن فروت", "Tropical passion fruit with a crisp, tangy finish.", "باشن فروت استوائي بنهاية منعشة وحامضة."),
            ("strawberry.jpg", "Fresh Strawberry", "فراولة طازجة", "Juicy strawberries blended smooth and cold.", "فراولة غنية ممزوجة بقوام ناعم وبارد."),
        ],
    },
    {
        "folder": "Hot latte", "name_en": "Hot Lattes", "name_ar": "لاتيه ساخن",
        "type": ProductType.DRINK, "cover": "Hot Latte Category.jpg",
        "slider_en": "Warm lattes", "slider_ar": "لاتيه دافئ",
        "products": [
            ("codex_put_a_good_name_for_this.jpeg", "Blueberry Velvet Latte", "لاتيه التوت المخملي", "A cozy latte with a delicate blueberry note.", "لاتيه دافئ بلمسة توت رقيقة."),
            ("codex_put_a_good_name_for_this3.jpg", "Honey Lavender Latte", "لاتيه العسل واللافندر", "Floral lavender latte gently sweetened with honey.", "لاتيه باللافندر محلى بلطف بالعسل."),
            ("Hot Latte Category.jpg", "Tomoor Signature Latte", "لاتيه تمور المميز", "Our signature smooth espresso with steamed milk.", "إسبريسو تمور المميز مع حليب مبخر ناعم."),
            ("hot latte.jpg", "Classic Hot Latte", "لاتيه ساخن كلاسيك", "Rich espresso softened with silky steamed milk.", "إسبريسو غني مع حليب مبخر حريري."),
        ],
    },
    {
        "folder": "sandwitches", "name_en": "Sandwiches", "name_ar": "ساندويشات",
        "type": ProductType.FOOD, "cover": "sandwitches-category.jpg",
        "slider_en": "Fresh sandwiches", "slider_ar": "ساندويشات طازجة",
        "products": [
            ("sandwitch_1.jpg", "Grilled Chicken Sandwich", "ساندويش دجاج مشوي", "Tender grilled chicken with crisp vegetables and house sauce.", "دجاج مشوي طري مع خضار طازجة وصوص الدار."),
            ("sandwitch_2.jpg", "Turkey & Cheese Sandwich", "ساندويش حبش وجبنة", "Smoked turkey and melted cheese in toasted bread.", "حبش مدخن وجبنة ذائبة في خبز محمص."),
            ("sandwitch_3.jpg", "Halloumi Garden Sandwich", "ساندويش حلوم بالخضار", "Grilled halloumi with fresh greens and tomato.", "جبنة حلوم مشوية مع خضار طازجة وطماطم."),
            ("sandwitches-category.jpg", "Tomoor Club Sandwich", "كلوب ساندويش تمور", "A generous layered club with chicken, cheese, and vegetables.", "كلوب ساندويش غني بطبقات الدجاج والجبنة والخضار."),
        ],
    },
]


def _slug(value: str) -> str:
    return sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _install_seed_images() -> dict[tuple[str, str], str]:
    candidates = [
        Path("/app/seed-assets/seed_images"),
        Path(__file__).resolve().parents[3] / "Tomoor-CafeUI" / "src" / "assets" / "seed_images",
    ]
    source_root = next((path for path in candidates if path.is_dir()), None)
    if source_root is None:
        raise RuntimeError("seed_images directory was not found")

    target_root = Path(settings.UPLOAD_DIR).resolve() / "seed"
    installed = {}
    for category in CATEGORIES:
        folder = category["folder"]
        target_dir = target_root / _slug(folder)
        target_dir.mkdir(parents=True, exist_ok=True)
        for filename, *_ in category["products"]:
            source = source_root / folder / filename
            if not source.is_file():
                raise RuntimeError(f"Missing seed image: {source}")
            target_name = f"{_slug(source.stem)}{source.suffix.lower()}"
            target = target_dir / target_name
            if not target.exists():
                copyfile(source, target)
            installed[(folder, filename)] = f"/uploads/seed/{_slug(folder)}/{target_name}"
    return installed


def seed_catalog(db: Session) -> bool:
    """Seed a fresh catalog once; the presence of any product is the only guard."""
    if db.query(Product.id).first() is not None:
        return False

    images = _install_seed_images()
    prices = Random(20260815)
    drink_index = 0

    for order, category_seed in enumerate(CATEGORIES, start=1):
        folder = category_seed["folder"]
        cover = images[(folder, category_seed["cover"])]
        category = Category(
            name_en=category_seed["name_en"], name_ar=category_seed["name_ar"],
            image=cover, is_active=True,
        )
        db.add(category)
        db.flush()

        db.add(Slider(
            title_en=category_seed["slider_en"], title_ar=category_seed["slider_ar"],
            display_order=order, image=cover, is_active=True,
        ))

        for filename, name_en, name_ar, description_en, description_ar in category_seed["products"]:
            product = Product(
                category_id=category.id, name_en=name_en, name_ar=name_ar,
                description_en=description_en, description_ar=description_ar,
                product_type=category_seed["type"], image=images[(folder, filename)], is_active=True,
            )
            if category_seed["type"] == ProductType.FOOD:
                product.food = Food(price=prices.randint(7, 30))
            else:
                base = prices.randint(7, 23)
                pattern = drink_index % 3
                product.drink = Drink(
                    small_price=base,
                    medium_price=base + 3 if pattern != 2 else None,
                    large_price=base + 6 if pattern != 1 else None,
                )
                drink_index += 1
            db.add(product)

    return True
