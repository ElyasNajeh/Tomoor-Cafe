from __future__ import annotations

import tempfile
import unittest
from io import BytesIO
from pathlib import Path

from PIL import Image

from app.core.config import settings
from app.shared.images import ImageProcessingError, process_image_bytes, verify_webp


def _encoded_image(
    image: Image.Image,
    image_format: str,
    *,
    exif: Image.Exif | None = None,
) -> bytes:
    output = BytesIO()
    options = {"exif": exif} if exif is not None else {}
    image.save(output, format=image_format, **options)
    return output.getvalue()


class ImageProcessingTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.original_upload_dir = settings.UPLOAD_DIR
        settings.UPLOAD_DIR = self.temporary_directory.name

    def tearDown(self) -> None:
        settings.UPLOAD_DIR = self.original_upload_dir
        self.temporary_directory.cleanup()

    def test_png_transparency_and_dimensions_are_preserved(self) -> None:
        source = Image.new("RGBA", (13, 7), (40, 120, 200, 0))
        source.putpixel((6, 3), (200, 100, 20, 128))

        result = process_image_bytes(
            _encoded_image(source, "PNG"),
            "products",
            expected_format="PNG",
        )

        self.assertEqual(result.path.suffix, ".webp")
        self.assertEqual(result.content_type, "image/webp")
        self.assertTrue(verify_webp(result.path))
        with Image.open(result.path) as converted:
            converted.load()
            self.assertEqual(converted.size, (13, 7))
            self.assertEqual(converted.mode, "RGBA")
            self.assertEqual(converted.getpixel((0, 0))[3], 0)
            self.assertEqual(converted.getpixel((6, 3))[3], 128)
            self.assertFalse(converted.getexif())

    def test_exif_orientation_is_applied_without_resizing(self) -> None:
        source = Image.new("RGB", (10, 20), "red")
        exif = Image.Exif()
        exif[274] = 6
        exif[315] = "metadata that must be stripped"

        result = process_image_bytes(
            _encoded_image(source, "JPEG", exif=exif),
            "categories",
            expected_format="JPEG",
        )

        with Image.open(result.path) as converted:
            converted.load()
            self.assertEqual(converted.size, (20, 10))
            self.assertFalse(converted.getexif())

    def test_invalid_content_and_mime_mismatch_are_rejected(self) -> None:
        with self.assertRaises(ImageProcessingError):
            process_image_bytes(b"not an image", "sliders", expected_format="PNG")

        jpeg = _encoded_image(Image.new("RGB", (2, 2), "blue"), "JPEG")
        with self.assertRaises(ImageProcessingError):
            process_image_bytes(jpeg, "sliders", expected_format="PNG")

    def test_generated_names_are_unique_webp_files(self) -> None:
        png = _encoded_image(Image.new("RGB", (2, 2), "green"), "PNG")
        first = process_image_bytes(png, "products")
        second = process_image_bytes(png, "products")

        self.assertNotEqual(first.filename, second.filename)
        self.assertTrue(Path(first.path).is_file())
        self.assertTrue(Path(second.path).is_file())


if __name__ == "__main__":
    unittest.main()
