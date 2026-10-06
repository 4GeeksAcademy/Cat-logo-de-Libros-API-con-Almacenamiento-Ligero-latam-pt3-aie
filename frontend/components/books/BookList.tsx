import { BookCard } from "@/components/books/BookCard";
import type { Book } from "@/types/book";

export function BookList({ books }: { books: Book[] }) {
  if (books.length === 0) return <p className="empty-state">Todavía no hay libros en el catálogo.</p>;
  return <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>;
}
