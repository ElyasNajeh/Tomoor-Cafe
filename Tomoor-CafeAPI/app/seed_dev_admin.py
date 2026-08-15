from app.core.security import hash_password
from app.db.session import sessionLocal
from app.features.admins.model import Admin


DEV_ADMIN_EMAIL = "a@gmail.com"
DEV_ADMIN_PASSWORD = "1234"


def main():
    with sessionLocal() as db:
        existing_admin = db.query(Admin).filter(Admin.email == DEV_ADMIN_EMAIL).first()
        if existing_admin:
            print("Development admin already exists")
            return

        db.add(
            Admin(
                email=DEV_ADMIN_EMAIL,
                hashed_password=hash_password(DEV_ADMIN_PASSWORD),
            )
        )
        db.commit()

    print("Development admin seeded")


if __name__ == "__main__":
    main()
