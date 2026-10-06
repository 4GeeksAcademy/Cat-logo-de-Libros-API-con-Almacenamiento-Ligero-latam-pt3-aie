from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.controllers import book_controller
from app.models.book import Book, BookCreate, BookStatusUpdate
from app.security import get_current_user, require_admin
from tinydb.table import Document


router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=list[Book])
def list_books(_current_user: Document = Depends(get_current_user)) -> list[Book]:
    return book_controller.list_books()


@router.get("/{book_id}", response_model=Book)
def get_book(book_id: int, _current_user: Document = Depends(get_current_user)) -> Book:
    book = book_controller.get_book(book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("", response_model=Book, status_code=status.HTTP_201_CREATED)
def create_book(book: BookCreate, _admin: Document = Depends(require_admin)) -> Book:
    return book_controller.create_book(book)


@router.patch("/{book_id}/status", response_model=Book)
def update_book_status(
    book_id: int,
    update: BookStatusUpdate,
    _admin: Document = Depends(require_admin),
) -> Book:
    updated_book = book_controller.update_book_status(book_id, update.status)
    if updated_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return updated_book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, _admin: Document = Depends(require_admin)) -> Response:
    if not book_controller.delete_book(book_id):
        raise HTTPException(status_code=404, detail="Book not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

    