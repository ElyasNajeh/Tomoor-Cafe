from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError

from app.core.config import settings
from app.db.session import get_db

pwd_context = CryptContext(schemes=["bcrypt"])


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)


def create_token(subject: int, token_type: str, expires_delta: timedelta):
    to_encode = {"sub": str(subject), "type": token_type}
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encode_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encode_jwt


def verify_token(token: str, expected_type: str):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        subject = payload.get("sub")
        if subject is None or payload.get("type") != expected_type:
            raise JWTError
        return int(subject)
    except (JWTError, TypeError, ValueError):
        return None


def get_current_user(request: Request, db: Session = Depends(get_db)):
    access_token = request.cookies.get("access_token")
    if access_token is None:
        raise HTTPException(status_code=401, detail="Token missing")
    admin_id = verify_token(access_token, "access")
    if admin_id is None:
        raise HTTPException(status_code=401, detail="Invalid Token")
    from app.features.admins.model import Admin

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if admin is None:
        raise HTTPException(status_code=401, detail="Admin no longer exists")
    return admin
