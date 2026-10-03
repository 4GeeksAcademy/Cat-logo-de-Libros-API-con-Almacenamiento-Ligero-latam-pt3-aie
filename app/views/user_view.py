from fastapi import APIRouter, Depends, HTTPException, status

from app.controllers import user_controller
from app.models.user import UserCreate, UserResponse
from app.security import get_current_user
from tinydb.table import Document


router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate) -> UserResponse:
    if user_controller.user_exists(user.username, user.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered",
        )

    created_user, _profile = user_controller.create_user(user)
    return created_user


@router.get("", response_model=list[UserResponse])
def list_users(
    _current_user: Document = Depends(get_current_user),
) -> list[UserResponse]:
    return user_controller.list_users()