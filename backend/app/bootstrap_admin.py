import os

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.entities import User
from app.models.enums import UserRole


def require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise SystemExit(f"{name} is required to bootstrap the first admin.")
    return value


def bootstrap_admin() -> None:
    email = require_env("ADMIN_EMAIL").lower()
    password = require_env("ADMIN_PASSWORD")
    name = os.getenv("ADMIN_NAME", "Masar Admin").strip() or "Masar Admin"

    db = SessionLocal()
    try:
        existing = db.scalars(select(User).where(User.email == email)).first()
        if existing:
            if existing.role != UserRole.ADMIN:
                raise SystemExit(f"User {email} already exists and is not an admin.")
            print(f"Admin {email} already exists.")
            return

        admin = User(
            name=name,
            email=email,
            role=UserRole.ADMIN,
            password_hash=get_password_hash(password),
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Admin {email} created.")
    finally:
        db.close()


if __name__ == "__main__":
    bootstrap_admin()
