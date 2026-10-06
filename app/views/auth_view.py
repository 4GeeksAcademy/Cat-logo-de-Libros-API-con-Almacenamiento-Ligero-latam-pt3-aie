from fastapi import APIRouter, Depends, HTTPException, status
from tinydb.table import Document

from app.controllers.user_controller import authenticate_user, get_profile, get_user_role
from app.models.auth import CurrentUserResponse, LoginRequest
from app.models.token import Token
from app.security import create_access_token, get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest) -> dict[str, str]:
    user = authenticate_user(credentials.email, credentials.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "access_token": create_access_token(user["email"]),
        "token_type": "bearer",
    }


@router.get("/me", response_model=CurrentUserResponse)
def read_current_user(
    current_user: Document = Depends(get_current_user),
) -> CurrentUserResponse:
    profile = get_profile(current_user.doc_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return CurrentUserResponse(
        email=current_user["email"],
        role=get_user_role(current_user),
        profile=profile,
    )