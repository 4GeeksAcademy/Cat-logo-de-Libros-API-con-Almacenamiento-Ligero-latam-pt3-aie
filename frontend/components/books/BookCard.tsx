import type { Book } from "@/types/book";

const genreLabels: Record<Book["genre"], string> = {
  fiction: "Ficción",
  "non-fiction": "No ficción",
  mystery: "Misterio",
  "sci-fi": "Ciencia ficción",
};

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="book-card">
      <div className="book-cover" aria-hidden="true"><span>✦</span><small>{genreLabels[book.genre]}</small></div>
      <div className="book-info">
        <span className={`book-status ${book.status === "available" ? "available" : "checked-out"}`}>
          {book.status === "available" ? "Disponible" : "Prestado"}
        </span>
        <h3>{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <p className="book-meta">{genreLabels[book.genre]} <span>·</span> {book.pages} páginas</p>
      </div>
    </article>
  );
}
