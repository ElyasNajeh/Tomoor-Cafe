from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, ImageOps

from app.shared.images import ProcessedImage, process_image_path, save_image

SLIDER_WIDTH = 1200
SLIDER_HEIGHT = 800
SLIDER_UPLOAD_DIRECTORY = "sliders/composed"


@dataclass(frozen=True)
class SliderComposition:
    image: Image.Image
    strategy: str


def build_slider_composition(image: Image.Image) -> SliderComposition:
    """Scale and center-crop an image to the exact slider image-area size."""
    composed = ImageOps.fit(
        image,
        (SLIDER_WIDTH, SLIDER_HEIGHT),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )
    return SliderComposition(composed, "centered-cover-crop")


def compose_slider_image(image: Image.Image) -> Image.Image:
    return build_slider_composition(image).image


def save_slider_upload(file: UploadFile) -> dict[str, str | int]:
    return save_image(
        file,
        SLIDER_UPLOAD_DIRECTORY,
        transform=compose_slider_image,
    )


def process_slider_image_path(source: Path, subdirectory: str) -> ProcessedImage:
    return process_image_path(
        source,
        subdirectory,
        transform=compose_slider_image,
    )
