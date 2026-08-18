from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base
from app.features.categories.model import Category
from app.features.sliders.model import Slider
from app.migrate_images_to_webp import migrate
from app.migrate_slider_images import migrate as migrate_sliders
from app.shared.images import path_from_upload_url, process_image_path, verify_webp


class ImageMigrationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.original_upload_dir = settings.UPLOAD_DIR
        settings.UPLOAD_DIR = self.temporary_directory.name
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.session = sessionmaker(bind=self.engine)()

    def tearDown(self) -> None:
        self.session.close()
        self.engine.dispose()
        settings.UPLOAD_DIR = self.original_upload_dir
        self.temporary_directory.cleanup()

    def test_shared_legacy_image_is_converted_updated_and_deleted_once(self) -> None:
        source = Path(settings.UPLOAD_DIR) / "shared" / "cover.jpg"
        source.parent.mkdir(parents=True)
        Image.new("RGB", (64, 32), "orange").save(source, format="JPEG", quality=95)
        old_url = "/uploads/shared/cover.jpg"

        self.session.add(Category(
            name_ar="تصنيف",
            name_en="Category",
            image=old_url,
            is_active=True,
        ))
        self.session.add(Slider(
            title_ar="شريحة",
            title_en="Slider",
            display_order=1,
            image=old_url,
            is_active=True,
        ))
        self.session.commit()

        self.assertEqual(migrate(self.session), 0)
        self.session.expire_all()
        category = self.session.query(Category).one()
        slider = self.session.query(Slider).one()

        self.assertEqual(category.image, slider.image)
        self.assertTrue(category.image.endswith(".webp"))
        converted = path_from_upload_url(category.image)
        self.assertIsNotNone(converted)
        self.assertTrue(verify_webp(converted))
        self.assertFalse(source.exists())

        self.assertEqual(migrate(self.session), 0)
        self.assertEqual(len(list((Path(settings.UPLOAD_DIR) / "shared").glob("*.webp"))), 1)

    def test_existing_webp_slider_is_composed_without_deleting_shared_image(self) -> None:
        raw = Path(settings.UPLOAD_DIR) / "source.jpg"
        Image.new("RGB", (320, 1000), "brown").save(raw, format="JPEG")
        shared = process_image_path(raw, "shared")
        raw.unlink()

        category = Category(
            name_ar="مشترك",
            name_en="Shared",
            image=shared.url,
            is_active=True,
        )
        slider = Slider(
            title_ar="مشترك",
            title_en="Shared",
            display_order=2,
            image=shared.url,
            is_active=True,
        )
        self.session.add_all((category, slider))
        self.session.commit()

        self.assertEqual(migrate_sliders(self.session), 0)
        self.session.expire_all()
        category = self.session.query(Category).filter(Category.name_en == "Shared").one()
        slider = self.session.query(Slider).filter(Slider.title_en == "Shared").one()

        self.assertEqual(category.image, shared.url)
        self.assertTrue(shared.path.exists())
        self.assertTrue(slider.image.startswith("/uploads/sliders/composed/"))
        self.assertNotEqual(slider.image, shared.url)
        composed = path_from_upload_url(slider.image)
        self.assertIsNotNone(composed)
        self.assertTrue(verify_webp(composed))
        with Image.open(composed) as image:
            self.assertEqual(image.size, (1200, 800))

        self.assertEqual(migrate_sliders(self.session), 0)
        self.assertEqual(
            len(list((Path(settings.UPLOAD_DIR) / "sliders" / "composed").glob("*.webp"))),
            1,
        )


if __name__ == "__main__":
    unittest.main()
