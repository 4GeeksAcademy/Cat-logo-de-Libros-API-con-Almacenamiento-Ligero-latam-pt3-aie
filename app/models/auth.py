from pydantic import BaseModel, ConfigDict, Field

from app.models.profile import ProfileResponse


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1)


class CurrentUserResponse(BaseModel):
    email: str
    profile: ProfileResponse