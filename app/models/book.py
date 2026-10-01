from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Genre(str, Enum):
    FICTION = "fiction"
    NON_FICTION = "non-fiction"
    MYSTERY = "mystery"
    SCI_FI = "sci-fi"


class BookStatus(str, Enum):
    AVAILABLE = "available"
    CHECKED_OUT = "checked_out"


class BookCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1)
    author: str = Field(min_length=1)
    genre: Genre
    pages: int = Field(gt=0)
    status: BookStatus


class BookStatusUpdate(BaseModel):
    status: BookStatus


class Book(BookCreate):
    id: int