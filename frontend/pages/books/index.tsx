import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { BookList } from "@/components/books/BookList";
import { fetchApi } from "@/lib/api";
import type { Book } from "@/types/book";
import { useAuth } from "@/hooks/useAuth";

export default function BooksPage() {
  const { status } = useAuth();
  const [books, setBooks] = useState<Book[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchApi<Book[]>("/books", { auth: true }).then(setBooks).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [status]);
  return <AuthGuard><section className="page-heading"><span className="eyebrow">LA COLECCIÓN</span><h1>Todos los libros</h1><p>Encuentra algo que te acompañe en la próxima página.</p></section>{error && <p className="feedback feedback-error" role="alert">{error}</p>}{loading ? <p className="status-panel">Cargando catálogo…</p> : <BookList books={books} />}</AuthGuard>;
}
