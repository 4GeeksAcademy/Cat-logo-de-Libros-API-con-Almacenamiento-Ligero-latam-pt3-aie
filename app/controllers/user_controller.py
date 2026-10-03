import bcrypt
from tinydb import Query
from tinydb.table import Document

from app.database import profiles_table, users_table
from app.models.profile import ProfileResponse, ProfileUpdate
from app.models.user import UserCreate, UserResponse


def user_exists(username: str, email: str) -> bool:
    user = Query()
    return users_table.contains((user.username == username) | (user.email == email))


def authenticate_user(email: str, password: str) -> Document | None:
    user_query = Query()
    user = users_table.get(user_query.email == email)
    if user is None:
        return None

    password_hash = user.get("password_hash")
    if not isinstance(password_hash, str):
        return None

    if not bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8")):
        return None

    return user


def _to_user(document: Document) -> UserResponse:
    return UserResponse(id=document.doc_id, **document)


def create_user(user_data: UserCreate) -> tuple[UserResponse, ProfileResponse]:
    password_hash = bcrypt.hashpw(
        user_data.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    user_id = users_table.insert(
        {
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": password_hash,
        }
    )
    profile_id = profiles_table.insert(
        {
            "user_id": user_id,
            "full_name": user_data.username,
            "bio": None,
            "phone": None,
            "address": None,
        }
    )

    saved_user = users_table.get(doc_id=user_id)
    if saved_user is None:
        raise RuntimeError("Could not retrieve the newly created user")

    return (
        _to_user(saved_user),
        ProfileResponse(
            id=profile_id,
            user_id=user_id,
            full_name=user_data.username,
            bio=None,
            phone=None,
            address=None,
        ),
    )


def list_users() -> list[UserResponse]:
    return [_to_user(document) for document in users_table]


def get_profile(user_id: int) -> ProfileResponse | None:
    profile = profiles_table.get(Query().user_id == user_id)
    if profile is None:
        return None
    return ProfileResponse(id=profile.doc_id, **profile)


def update_profile(
    user_id: int,
    profile_data: ProfileUpdate,
) -> ProfileResponse | None:
    profile = profiles_table.get(Query().user_id == user_id)
    if profile is None:
        return None

    profiles_table.update(profile_data.model_dump(), doc_ids=[profile.doc_id])
    updated_profile = profiles_table.get(doc_id=profile.doc_id)
    if updated_profile is None:
        return None
    return ProfileResponse(id=updated_profile.doc_id, **updated_profile)