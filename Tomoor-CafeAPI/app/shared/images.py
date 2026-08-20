from __future__ import annotations

import os
import warnings
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path, PurePosixPath
from typing import Callable
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy.orm import Session

from app.core.config import settings

from pillow_heif import register_heif_opener

register_heif_opener()

WEBP_QUALITY = 84
WEBP_METHOD = 6
WEBP_CONTENT_TYPE = "image/webp"
ImageTransform = Callable[[Image.Image], Image.Image]


@dataclass(frozen=True)
class ProcessedImage:
    filename: str
    url: str
    path: Path
    size: int
    content_type: str = WEBP_CONTENT_TYPE

    def as_response(self) -> dict[str, str | int]:
        return {
            "filename": self.filename,
            "url": self.url,
            "content_type": self.content_type,
            "size": self.size,
        }


class ImageProcessingError(ValueError):
    pass


def _upload_root() -> Path:
    return Path(settings.UPLOAD_DIR).resolve()


def _target_directory(subdirectory: str) -> Path:
    normalized = PurePosixPath(subdirectory.replace("\\", "/"))
    if normalized.is_absolute() or ".." in normalized.parts:
        raise ImageProcessingError("Invalid image storage directory")

    root = _upload_root()
    target = root.joinpath(*normalized.parts).resolve()
    if not target.is_relative_to(root):
        raise ImageProcessingError("Invalid image storage directory")
    return target


def _prepare_for_webp(content: bytes) -> Image.Image:
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)

            with Image.open(BytesIO(content)) as source:
                source.load()

                if getattr(source, "is_animated", False):
                    source.seek(0)

                oriented = ImageOps.exif_transpose(source)

                has_alpha = oriented.mode in {"RGBA", "LA"} or (
                    oriented.mode == "P" and "transparency" in oriented.info
                )

                return oriented.convert("RGBA" if has_alpha else "RGB")

    except (Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise ImageProcessingError("Image dimensions are too large") from exc
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError) as exc:
        raise ImageProcessingError(
            "The uploaded file is not a supported image"
        ) from exc


def process_image_bytes(
    content: bytes,
    subdirectory: str,
    *,
    transform: ImageTransform | None = None,
) -> ProcessedImage:
    """Validate, orient, metadata-strip, and atomically store one WebP image."""
    if not content:
        raise ImageProcessingError("Image file is empty")

    source_image = _prepare_for_webp(content)
    image = source_image
    if transform is not None:
        try:
            image = transform(source_image)
        except ImageProcessingError:
            source_image.close()
            raise
        except Exception as exc:
            source_image.close()
            raise ImageProcessingError("Image composition could not be generated") from exc
        if image is not source_image:
            source_image.close()
    output = BytesIO()
    try:
        image.save(
            output,
            format="WEBP",
            quality=WEBP_QUALITY,
            method=WEBP_METHOD,
            exact=True,
        )
    except (OSError, ValueError) as exc:
        raise ImageProcessingError("Image could not be converted to WebP") from exc
    finally:
        image.close()

    encoded = output.getvalue()
    target_dir = _target_directory(subdirectory)
    target_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}.webp"
    target = target_dir / filename
    temporary = target_dir / f".{filename}.{uuid4().hex}.tmp"
    try:
        temporary.write_bytes(encoded)
        os.replace(temporary, target)
    except OSError as exc:
        temporary.unlink(missing_ok=True)
        raise ImageProcessingError("Processed image could not be stored") from exc

    relative = target.relative_to(_upload_root()).as_posix()
    return ProcessedImage(
        filename=filename,
        url=f"/uploads/{relative}",
        path=target,
        size=len(encoded),
    )


def process_image_path(
    source: Path,
    subdirectory: str,
    *,
    transform: ImageTransform | None = None,
) -> ProcessedImage:
    try:
        content = source.read_bytes()
    except OSError as exc:
        raise ImageProcessingError(f"Image could not be read: {source}") from exc
    return process_image_bytes(content, subdirectory, transform=transform)


def save_image(
    file: UploadFile,
    subdirectory: str,
    *,
    transform: ImageTransform | None = None,
) -> dict[str, str | int]:
    limit = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024 * 10
    content = file.file.read(limit + 1)
    if len(content) > limit:
        raise HTTPException(status_code=413, detail=f"Image must be {settings.MAX_IMAGE_SIZE_MB * 10} MB or smaller")

    try:
        return process_image_bytes(
            content,
            subdirectory,
            transform=transform,
        ).as_response()
    except ImageProcessingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def validate_webp_url(url: str) -> str:
    value = url.strip()
    if not value.startswith("/uploads/") or PurePosixPath(value).suffix.lower() != ".webp":
        raise ValueError("Image must reference a processed WebP upload")
    path = path_from_upload_url(value)
    if path is None:
        raise ValueError("Image upload path is invalid")
    if not path.is_file() or not verify_webp(path):
        raise ValueError("Image must reference a valid WebP file")
    return value


def path_from_upload_url(url: str) -> Path | None:
    prefix = "/uploads/"
    if not url.startswith(prefix):
        return None

    relative = PurePosixPath(url.removeprefix(prefix))
    if relative.is_absolute() or not relative.parts or ".." in relative.parts:
        return None

    root = _upload_root()
    path = root.joinpath(*relative.parts).resolve()
    return path if path.is_relative_to(root) else None


def verify_webp(path: Path) -> bool:
    if path.suffix.lower() != ".webp":
        return False
    try:
        with Image.open(path) as image:
            image.load()
            return image.format == "WEBP"
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
        return False


def delete_image_if_unreferenced(db: Session, url: str | None) -> bool:
    """Delete a managed image only when no catalog row still references it."""
    if not url:
        return False

    path = path_from_upload_url(url)
    if path is None:
        return False

    from app.features.categories.model import Category
    from app.features.products.model import Product
    from app.features.sliders.model import Slider

    try:
        is_referenced = any(
            db.query(model.id).filter(model.image == url).first() is not None
            for model in (Product, Category, Slider)
        )
    except Exception:
        db.rollback()
        return False

    if is_referenced:
        return False

    try:
        path.unlink(missing_ok=True)
        return True
    except OSError:
        return False


def cleanup_replaced_image(db: Session, previous_url: str | None, current_url: str | None) -> bool:
    if not previous_url or previous_url == current_url:
        return False
    return delete_image_if_unreferenced(db, previous_url)
