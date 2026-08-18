from __future__ import annotations

import argparse
from pathlib import PurePosixPath

from sqlalchemy.orm import Session

from app.db.session import sessionLocal
from app.features.categories.model import Category
from app.features.products.model import Product
from app.features.sliders.model import Slider
from app.shared.images import (
    ImageProcessingError,
    cleanup_replaced_image,
    path_from_upload_url,
    process_image_path,
    verify_webp,
)

IMAGE_MODELS = (Product, Category, Slider)
LEGACY_SUFFIXES = {".jpg", ".jpeg", ".png"}


def _catalog_image_urls(db: Session) -> set[str]:
    urls: set[str] = set()
    for model in IMAGE_MODELS:
        urls.update(
            value
            for value, in db.query(model.image).filter(model.image.isnot(None)).all()
            if value
        )
    return urls


def _reference_count(db: Session, url: str) -> int:
    return sum(
        db.query(model.id).filter(model.image == url).count()
        for model in IMAGE_MODELS
    )


def migrate(db: Session, *, dry_run: bool = False) -> int:
    converted = 0
    skipped_webp = 0
    skipped_unsupported = 0
    failed = 0
    total_before = 0
    total_after = 0

    for old_url in sorted(_catalog_image_urls(db)):
        suffix = PurePosixPath(old_url).suffix.lower()
        references = _reference_count(db, old_url)
        if suffix == ".webp":
            skipped_webp += references
            continue
        if suffix not in LEGACY_SUFFIXES:
            skipped_unsupported += references
            print(f"SKIP unsupported path ({references} reference(s)): {old_url}")
            continue

        source = path_from_upload_url(old_url)
        if source is None or not source.is_file():
            failed += references
            print(f"ERROR source file is missing or unmanaged: {old_url}")
            continue

        if dry_run:
            print(f"WOULD CONVERT ({references} reference(s)): {old_url}")
            continue

        processed = None
        committed = False
        try:
            relative = PurePosixPath(old_url.removeprefix("/uploads/"))
            subdirectory = relative.parent.as_posix()
            before_size = source.stat().st_size
            processed = process_image_path(source, subdirectory)
            if not verify_webp(processed.path):
                raise ImageProcessingError("WebP verification failed")

            updated = sum(
                db.query(model)
                .filter(model.image == old_url)
                .update({model.image: processed.url}, synchronize_session=False)
                for model in IMAGE_MODELS
            )
            if updated != references:
                raise RuntimeError(
                    f"Expected to update {references} reference(s), updated {updated}"
                )

            db.commit()
            committed = True
            if _reference_count(db, old_url) != 0:
                raise RuntimeError("Old database reference still exists after commit")
            if _reference_count(db, processed.url) < references:
                raise RuntimeError("New database reference verification failed")
            if not verify_webp(processed.path):
                raise RuntimeError("Stored WebP verification failed after commit")

            deleted = cleanup_replaced_image(db, old_url, processed.url)
            if source.exists() or not deleted:
                print(f"WARNING database updated, but old file could not be deleted: {old_url}")

            converted += references
            total_before += before_size
            total_after += processed.size
            print(
                f"CONVERTED ({references} reference(s)): {old_url} -> {processed.url} "
                f"({before_size} -> {processed.size} bytes)"
            )
        except Exception as exc:
            if not committed:
                db.rollback()
                if processed is not None:
                    processed.path.unlink(missing_ok=True)
            failed += references
            state = "old file retained" if not committed else "new WebP retained"
            print(f"ERROR {old_url}: {exc} ({state})")

    print(
        "SUMMARY "
        f"converted={converted} skipped_webp={skipped_webp} "
        f"skipped_unsupported={skipped_unsupported} failed={failed} "
        f"bytes_before={total_before} bytes_after={total_after}"
    )
    return 1 if failed else 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Safely convert catalog image files and database references to WebP."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List legacy database references without changing files or data.",
    )
    args = parser.parse_args()

    with sessionLocal() as db:
        raise SystemExit(migrate(db, dry_run=args.dry_run))


if __name__ == "__main__":
    main()
