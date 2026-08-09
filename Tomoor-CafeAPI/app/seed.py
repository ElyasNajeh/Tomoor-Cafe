from app.db.seed_catalog import seed_catalog
from app.db.session import sessionLocal


def main():
    with sessionLocal() as db:
        seed_catalog(db)
        db.commit()

    print("Catalog seeded")


if __name__ == "__main__":
    main()
