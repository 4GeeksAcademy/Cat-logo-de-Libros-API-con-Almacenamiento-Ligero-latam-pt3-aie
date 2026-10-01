from tinydb.table import Document

from app.database import books_table
from app.models.book import Book, BookCreate, BookStatus


def _to_book(document: Document) -> Book:
    return Book(id=document.doc_id, **document)


def list_books() -> list[Book]:
    return [_to_book(document) for document in books_table.all()]


def get_book(book_id: int) -> Book | None:
    document = books_table.get(doc_id=book_id)
    return _to_book(document) if document else None


def create_book(book: BookCreate) -> Book:
    book_id = books_table.insert(book.model_dump(mode="json"))
    return Book(id=book_id, **book.model_dump())


def update_book_status(book_id: int, status: BookStatus) -> Book | None:
    if not books_table.contains(doc_id=book_id):
        return None

    books_table.update({"status": status.value}, doc_ids=[book_id])
    return get_book(book_id)


def delete_book(book_id: int) -> bool:
    if not books_table.contains(doc_id=book_id):
        return False

    books_table.remove(doc_ids=[book_id])
    return True