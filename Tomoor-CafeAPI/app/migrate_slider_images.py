from __future__ import annotations

import argparse

from sqlalchemy.orm import Session

from app.db.session import sessionLocal
from app.features.sliders.images import process_slider_image_path
from app.features.sliders.model import Slider
from app.shared.images import (
    ImageProcessingError,
    cleanup_replaced_image,
    path_from_upload_url,
    verify_webp,
)

COMPOSED_PREFIXES = (
    "/uploads/sliders/composed/",
    "/uploads/seed/sliders/",
)


def _is_composed(url: str) -> bool:
    return url.endswith(".webp") and url.startswith(COMPOSED_PREFIXES)


def migrate(db: Session, *, dry_run: bool = False) -> int:
    urls = {
        value
        for value, in db.query(Slider.image).filter(Slider.image.isnot(None)).all()
        if value
    }
    converted = 0
    skipped = 0
    failed = 0

    for old_url in sorted(urls):
        references = db.query(Slider.id).filter(Slider.image == old_url).count()
        if _is_composed(old_url):
            skipped += references
            continue

        source = path_from_upload_url(old_url)
        if source is None or not source.is_file():
            failed += references
            print(f"ERROR source file is missing or unmanaged: {old_url}")
            continue

        if dry_run:
            print(f"WOULD COMPOSE ({references} slider(s)): {old_url}")
            continue

        processed = None
        committed = False
        try:
            before_size = source.stat().st_size
            processed = process_slider_image_path(source, "sliders/composed")
            if not verify_webp(processed.path):
                raise ImageProcessingError("Composed WebP verification failed")

            updated = (
                db.query(Slider)
                .filter(Slider.image == old_url)
                .update({Slider.image: processed.url}, synchronize_session=False)
            )
            if updated != references:
                raise RuntimeError(
                    f"Expected to update {references} slider(s), updated {updated}"
                )

            db.commit()
            committed = True
            old_references = db.query(Slider.id).filter(Slider.image == old_url).count()
            new_references = db.query(Slider.id).filter(Slider.image == processed.url).count()
            if old_references != 0 or new_references < references:
                raise RuntimeError("Slider database reference verification failed")
            if not verify_webp(processed.path):
                raise RuntimeError("Stored slider WebP verification failed after commit")

            deleted = cleanup_replaced_image(db, old_url, processed.url)
            retention = "deleted old file" if deleted else "retained shared old file"
            converted += references
            print(
                f"COMPOSED ({references} slider(s)): {old_url} -> {processed.url} "
                f"({before_size} -> {processed.size} bytes; {retention})"
            )
        except Exception as exc:
            if not committed:
                db.rollback()
                if processed is not None:
                    processed.path.unlink(missing_ok=True)
            failed += references
            state = "old slider retained" if not committed else "new slider retained"
            print(f"ERROR {old_url}: {exc} ({state})")

    print(f"SUMMARY composed={converted} skipped={skipped} failed={failed}")
    return 1 if failed else 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create slider-ready compositions for existing slider images."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List slider images that require composition without changing files or data.",
    )
    args = parser.parse_args()
    with sessionLocal() as db:
        raise SystemExit(migrate(db, dry_run=args.dry_run))


if __name__ == "__main__":
    main()
