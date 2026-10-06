import { useEffect, useState, type FormEvent } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { FormField } from "@/components/FormField";
import { fetchApi } from "@/lib/api";
import { validateBook } from "@/lib/validation";
import type { Book, BookCreateInput, BookStatus } from "@/types/book";
import { useAuth } from "@/hooks/useAuth";

const emptyBook: BookCreateInput = { title: "", author: "", genre: "fiction", pages: 1, status: "available" };

export default function AdminPage() {
  const { status } = useAuth();
  const [books, setBooks] = useState<Book[]>([]); const [form, setForm] = useState<BookCreateInput>(emptyBook);
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [busy, setBusy] = useState(false);
  const refresh = () => fetchApi<Book[]>("/books", { auth: true }).then(setBooks).catch((reason: Error) => setError(reason.message));
  useEffect(() => { if (status === "authenticated") void refresh(); }, [status]);

  async function createBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess("");
    const invalid = validateBook(form); if (invalid) { setError(invalid); return; }
    setBusy(true);
    try { await fetchApi<Book>("/books", { method: "POST", auth: true, body: form }); setForm({ ...emptyBook }); setSuccess("Libro agregado."); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo agregar el libro."); }
    finally { setBusy(false); }
  }

  async function changeStatus(book: Book, status: BookStatus) {
    setError("");
    try { await fetchApi<Book>(`/books/${book.id}/status`, { method: "PATCH", auth: true, body: { status } }); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar el libro."); }
  }

  async function deleteBook(book: Book) {
    if (!window.confirm(`¿Eliminar «${book.title}» del catálogo?`)) return;
    setError("");
    try { await fetchApi<void>(`/books/${book.id}`, { method: "DELETE", auth: true }); setSuccess("Libro eliminado."); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo eliminar el libro."); }
  }

  return <AuthGuard role="admin"><section className="page-heading"><span className="eyebrow">SOLO ADMINISTRACIÓN</span><h1>Gestionar catálogo</h1><p>Agrega libros y mantén actualizada la colección.</p></section>{error && <FeedbackMessage message={error} />}{success && <FeedbackMessage message={success} kind="success" />}<div className="admin-layout"><section className="profile-form-card"><h2>Agregar libro</h2><form onSubmit={createBook} noValidate>
    <FormField label="Título" name="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
    <FormField label="Autor" name="author" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} required />
    <FormField label="Páginas" name="pages" type="number" min={1} value={form.pages} onChange={(event) => setForm({ ...form, pages: Number(event.target.value) })} required />
    <div className="field"><label htmlFor="genre">Género</label><select id="genre" value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value as BookCreateInput["genre"] })}><option value="fiction">Ficción</option><option value="non-fiction">No ficción</option><option value="mystery">Misterio</option><option value="sci-fi">Ciencia ficción</option></select></div>
    <div className="field"><label htmlFor="status">Estado inicial</label><select id="status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as BookStatus })}><option value="available">Disponible</option><option value="checked_out">Prestado</option></select></div>
    <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Agregando…" : "Agregar libro"}</button>
  </form></section><section className="admin-book-list"><h2>Libros en la colección <span className="count-pill">{books.length}</span></h2>{books.map((book) => <article className="admin-book-row" key={book.id}><div><h3>{book.title}</h3><p>{book.author} · {book.status === "available" ? "Disponible" : "Prestado"}</p></div><div className="row-actions"><button type="button" onClick={() => void changeStatus(book, book.status === "available" ? "checked_out" : "available")}>Cambiar estado</button><button type="button" className="danger-link" onClick={() => void deleteBook(book)}>Eliminar</button></div></article>)}</section></div></AuthGuard>;
}
