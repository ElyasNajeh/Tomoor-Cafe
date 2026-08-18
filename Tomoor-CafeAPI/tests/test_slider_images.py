from __future__ import annotations

import tempfile
import unittest
from io import BytesIO

from PIL import Image, ImageDraw

from app.core.config import settings
from app.features.sliders.images import (
    SLIDER_HEIGHT,
    SLIDER_WIDTH,
    build_slider_composition,
    compose_slider_image,
)
from app.shared.images import process_image_bytes, verify_webp


class SliderImageTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.original_upload_dir = settings.UPLOAD_DIR
        settings.UPLOAD_DIR = self.temporary_directory.name

    def tearDown(self) -> None:
        settings.UPLOAD_DIR = self.original_upload_dir
        self.temporary_directory.cleanup()

    def test_square_image_is_scaled_and_center_cropped_to_fill_target(self) -> None:
        source = Image.new("RGB", (900, 900), (85, 60, 40))
        composition = build_slider_composition(source)

        self.assertEqual(composition.strategy, "centered-cover-crop")
        self.assertEqual(composition.image.size, (SLIDER_WIDTH, SLIDER_HEIGHT))
        self.assertEqual(composition.image.getbbox(), (0, 0, SLIDER_WIDTH, SLIDER_HEIGHT))
        composition.image.close()

    def test_wide_image_crops_equal_excess_from_left_and_right(self) -> None:
        source = Image.new("RGB", (1800, 800), "green")
        draw = ImageDraw.Draw(source)
        draw.rectangle((0, 0, 299, 799), fill="red")
        draw.rectangle((1500, 0, 1799, 799), fill="blue")

        composition = build_slider_composition(source)

        self.assertEqual(composition.image.size, (SLIDER_WIDTH, SLIDER_HEIGHT))
        self.assertEqual(composition.image.getpixel((0, SLIDER_HEIGHT // 2)), (0, 128, 0))
        self.assertEqual(
            composition.image.getpixel((SLIDER_WIDTH - 1, SLIDER_HEIGHT // 2)),
            (0, 128, 0),
        )
        composition.image.close()

    def test_tall_image_crops_equal_excess_from_top_and_bottom(self) -> None:
        source = Image.new("RGB", (1200, 1600), "green")
        draw = ImageDraw.Draw(source)
        draw.rectangle((0, 0, 1199, 399), fill="red")
        draw.rectangle((0, 1200, 1199, 1599), fill="blue")

        composition = build_slider_composition(source)

        self.assertEqual(composition.image.size, (SLIDER_WIDTH, SLIDER_HEIGHT))
        self.assertEqual(composition.image.getpixel((SLIDER_WIDTH // 2, 0)), (0, 128, 0))
        self.assertEqual(
            composition.image.getpixel((SLIDER_WIDTH // 2, SLIDER_HEIGHT - 1)),
            (0, 128, 0),
        )
        composition.image.close()

    def test_small_image_is_upscaled_to_fill_without_padding(self) -> None:
        source = Image.new("RGB", (30, 20), (23, 45, 67))
        composition = build_slider_composition(source)

        self.assertEqual(composition.image.size, (SLIDER_WIDTH, SLIDER_HEIGHT))
        self.assertEqual(
            composition.image.getextrema(),
            ((23, 23), (45, 45), (67, 67)),
        )
        composition.image.close()

    def test_composition_still_uses_shared_webp_encoder(self) -> None:
        source = Image.new("RGB", (320, 1000), (40, 30, 25))
        ImageDraw.Draw(source).rectangle((100, 80, 220, 920), fill=(220, 170, 90))
        encoded = BytesIO()
        source.save(encoded, format="PNG")

        result = process_image_bytes(
            encoded.getvalue(),
            "sliders/composed",
            expected_format="PNG",
            transform=compose_slider_image,
        )

        self.assertTrue(result.url.startswith("/uploads/sliders/composed/"))
        self.assertTrue(result.url.endswith(".webp"))
        self.assertEqual(result.content_type, "image/webp")
        self.assertTrue(verify_webp(result.path))
        with Image.open(result.path) as converted:
            self.assertEqual(converted.size, (SLIDER_WIDTH, SLIDER_HEIGHT))


if __name__ == "__main__":
    unittest.main()
