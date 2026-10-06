from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from jose.exceptions import JWTError
from tinydb import Query
from tinydb.table import Document

from app.config import settings
from app.controllers.user_controller import get_user_role
from app.database import users_table


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(
    subject: str | int,
    expires_delta: timedelta | None = None,
) -> str:
    expiration = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload: dict[str, Any] = {"sub": str(subject), "exp": expiration}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> Document:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        email = payload.get("sub")
        if not isinstance(email, str) or not email:
            raise unauthorized
    except JWTError as exc:
        raise unauthorized from exc

    user = users_table.get(Query().email == email)
    if user is None:
        raise unauthorized
    return user


def require_admin(current_user: Document = Depends(get_current_user)) -> Document:
    if get_user_role(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator role required",
        )
    return current_user