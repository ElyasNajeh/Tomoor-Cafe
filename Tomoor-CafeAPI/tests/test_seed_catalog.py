import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.seed_catalog import CATEGORIES, _seed_source_root, refresh_seed_slider_images
from app.features.sliders.model import Slider
from app.shared.images import ProcessedImage


class SeedCatalogTests(unittest.TestCase):
    def test_every_referenced_seed_image_exists(self) -> None:
        source_root = _seed_source_root()

        for category in CATEGORIES:
            filenames = {
                category["cover"],
                category.get("slider", category["cover"]),
                *(filename for filename, *_ in category["products"]),
            }
            for filename in filenames:
                image = source_root / category["folder"] / filename
                self.assertTrue(image.is_file(), f"Missing seed image: {image}")

    def test_requested_latte_slider_overrides_are_configured(self) -> None:
        categories = {category["folder"]: category for category in CATEGORIES}

        self.assertEqual(
            categories["Cold Lattes"]["slider"],
            "iced caramel-must-be-slider.jpg",
        )
        self.assertEqual(
            categories["Hot latte"]["slider"],
            "hot latte-must-be-slider.jpg",
        )
        self.assertEqual(categories["Cold Lattes"]["cover"], "iced-spanish-latte.jpg")
        self.assertEqual(categories["Hot latte"]["cover"], "Hot Latte Category.jpg")

    def test_refresh_updates_only_changed_seed_slider_images(self) -> None:
        engine = create_engine("sqlite:///:memory:")
        Slider.__table__.create(engine)

        with tempfile.TemporaryDirectory() as temporary_directory, Session(engine) as db:
            temporary_root = Path(temporary_directory)
            current_cold = temporary_root / "current-cold.webp"
            current_hot = temporary_root / "current-hot.webp"
            refreshed_cold = temporary_root / "refreshed-cold.webp"
            refreshed_hot = temporary_root / "refreshed-hot.webp"
            current_cold.write_bytes(b"old cold image")
            current_hot.write_bytes(b"same hot image")
            refreshed_cold.write_bytes(b"new cold image")
            refreshed_hot.write_bytes(b"same hot image")

            cold_seed = CATEGORIES[0]
            hot_seed = CATEGORIES[4]
            cold_slider = Slider(
                title_en=cold_seed["slider_en"],
                title_ar=cold_seed["slider_ar"],
                display_order=1,
                image="/uploads/current-cold.webp",
                is_active=False,
            )
            hot_slider = Slider(
                title_en=hot_seed["slider_en"],
                title_ar=hot_seed["slider_ar"],
                display_order=5,
                image="/uploads/current-hot.webp",
                is_active=True,
            )
            db.add_all((cold_slider, hot_slider))
            db.flush()

            processed = (
                ProcessedImage(
                    filename=refreshed_cold.name,
                    url="/uploads/refreshed-cold.webp",
                    path=refreshed_cold,
                    size=refreshed_cold.stat().st_size,
                ),
                ProcessedImage(
                    filename=refreshed_hot.name,
                    url="/uploads/refreshed-hot.webp",
                    path=refreshed_hot,
                    size=refreshed_hot.stat().st_size,
                ),
            )
            current_paths = {
                cold_slider.image: current_cold,
                hot_slider.image: current_hot,
            }

            with (
                patch("app.db.seed_catalog._seed_source_root", return_value=Path("seed-assets")),
                patch("app.db.seed_catalog.process_slider_image_path", side_effect=processed),
                patch(
                    "app.db.seed_catalog.path_from_upload_url",
                    side_effect=current_paths.get,
                ),
            ):
                result = refresh_seed_slider_images(db)

            self.assertEqual(result.updated, 1)
            self.assertEqual(result.unchanged, 1)
            self.assertEqual(result.missing, 0)
            self.assertEqual(result.previous_images, ("/uploads/current-cold.webp",))
            self.assertEqual(cold_slider.image, "/uploads/refreshed-cold.webp")
            self.assertEqual(hot_slider.image, "/uploads/current-hot.webp")
            self.assertFalse(cold_slider.is_active)
            self.assertTrue(hot_slider.is_active)
            self.assertFalse(refreshed_hot.exists())


if __name__ == "__main__":
    unittest.main()
