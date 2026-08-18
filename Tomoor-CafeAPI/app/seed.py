import argparse

from app.db.seed_catalog import refresh_seed_slider_images, seed_catalog
from app.db.session import sessionLocal
from app.shared.images import delete_image_if_unreferenced


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Install the bundled catalog seed data.")
    parser.add_argument(
        "--refresh-sliders",
        action="store_true",
        help="Update seed-managed slider images without resetting existing catalog data.",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    with sessionLocal() as db:
        if seed_catalog(db):
            db.commit()
            print("Catalog seeded")
            return

        if not args.refresh_sliders:
            print("Catalog already contains products; no changes made")
            return

        result = refresh_seed_slider_images(db)
        db.commit()
        for previous_image in result.previous_images:
            delete_image_if_unreferenced(db, previous_image)

    print(
        "Seed slider images refreshed: "
        f"{result.updated} updated, {result.unchanged} unchanged, "
        f"{result.missing} seed sliders not found"
    )


if __name__ == "__main__":
    main()
