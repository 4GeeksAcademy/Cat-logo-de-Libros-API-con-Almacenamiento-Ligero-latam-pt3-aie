from pydantic import BaseModel, ConfigDict, Field


class ProfileCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=1, max_length=100)
    bio: str | None = Field(default=None, max_length=500)
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=250)


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=250)


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    bio: str | None = None
    phone: str | None = None
    address: str | None = None