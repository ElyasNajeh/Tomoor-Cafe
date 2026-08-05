import argparse
from getpass import getpass

from pydantic import EmailStr, TypeAdapter, ValidationError

from app.core.security import hash_password
from app.db.init_db import create_tables
from app.db.session import sessionLocal
from app.features.admins.model import Admin


def main() -> None:
    parser = argparse.ArgumentParser(description="Create the first Tomoor Cafe admin")
    parser.add_argument("--username", required=True)
    parser.add_argument("--email", required=True)
    args = parser.parse_args()

    try:
        email = str(TypeAdapter(EmailStr).validate_python(args.email))
    except ValidationError as exc:
        parser.error(str(exc))

    password = getpass("Admin password: ")
    confirmation = getpass("Confirm password: ")
    if len(password) < 8 or password != confirmation:
        parser.error("Passwords must match and contain at least 8 characters")

    create_tables()
    with sessionLocal() as db:
        if db.query(Admin).count() != 0:
            parser.error("Bootstrap is only available when no admins exist")
        admin = Admin(username=args.username, email=email, hashed_password=hash_password(password))
        db.add(admin)
        db.commit()
        print(f"Created admin '{admin.username}'.")


if __name__ == "__main__":
    main()
