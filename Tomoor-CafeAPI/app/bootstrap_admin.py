from app.core.security import hash_password
from app.db.init_db import create_tables
from app.db.session import sessionLocal
from app.features.admins.model import Admin


def main() -> None:
    create_tables()
    with sessionLocal() as db:
        if db.query(Admin).count() != 0:
            raise SystemExit("Bootstrap is only available when no admins exist")
        admin = Admin(email="a@gmail.com", hashed_password=hash_password("1234"))
        db.add(admin)
        db.commit()
        print(f"Created admin '{admin.email}'.")


if __name__ == "__main__":
    main()
