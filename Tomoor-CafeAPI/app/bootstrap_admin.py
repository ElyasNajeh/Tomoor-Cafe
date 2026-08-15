from getpass import getpass

from app.core.security import hash_password
from app.db.session import sessionLocal
from app.features.admins.model import Admin


def main():
    email = input("Admin email: ").strip().lower()
    password = getpass("Admin password: ")

    if len(password) < 4:
        raise SystemExit(
            "Password must be at least 4 characters"
        )

    with sessionLocal() as db:
        if db.query(Admin).count() != 0:
            raise SystemExit(
                "An admin already exists"
            )

        admin = Admin(
            email=email,
            hashed_password=hash_password(password),
        )

        db.add(admin)
        db.commit()

        print("Admin created successfully")


if __name__ == "__main__":
    main()
