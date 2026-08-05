from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def save_image(file: UploadFile, subdirectory: str) -> dict[str, str]:
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")

    content = file.file.read(settings.MAX_IMAGE_SIZE_MB * 1024 * 1024 + 1)
    if len(content) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Image must be {settings.MAX_IMAGE_SIZE_MB} MB or smaller")
    if not content:
        raise HTTPException(status_code=400, detail="Image file is empty")

    upload_dir = Path(settings.UPLOAD_DIR).resolve() / subdirectory
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    (upload_dir / filename).write_bytes(content)
    url = f"/uploads/{subdirectory}/{filename}"
    return {"filename": filename, "url": url}
