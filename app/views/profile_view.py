from fastapi import APIRouter, Depends, HTTPException
from tinydb.table import Document

from app.controllers.user_controller import get_profile, update_profile
from app.models.profile import ProfileResponse, ProfileUpdate
from app.security import get_current_user


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileResponse)
def read_my_profile(
    current_user: Document = Depends(get_current_user),
) -> ProfileResponse:
    profile = get_profile(current_user.doc_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: Document = Depends(get_current_user),
) -> ProfileResponse:
    profile = update_profile(current_user.doc_id, profile_data)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile