import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { Book } from "@/types/book";
import { BookList } from "@/components/books/BookList";

export default function HomePage() {
  const { status, user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchApi<Book[]>("/books", { auth: true }).then(setBooks).catch((reason: Error) => setError(reason.message));
  }, [status]);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">UN LUGAR PARA CADA HISTORIA</span>
          <h1>Encuentra tu<br /><em>próxima lectura.</em></h1>
          <p>Una colección curada para lectores curiosos. Explora nuevos mundos, vuelve a tus clásicos y deja que un libro te sorprenda.</p>
          <Link className="button button-primary" href={status === "authenticated" ? ROUTES.books : ROUTES.login}>Explorar catálogo <span aria-hidden="true">→</span></Link>
        </div>
        <div className="hero-art" aria-label="Ilustración de libros apilados" role="img">
          <div className="sun-disc" /><div className="plant plant-one">✳</div><div className="plant plant-two">✳</div>
          <div className="stack-book stack-book-one"><small>UNA CASA<br />EN EL MAR</small><span>✦</span></div>
          <div className="stack-book stack-book-two"><small>EL ARTE DE<br />MIRAR</small><span>02</span></div>
          <div className="stack-book stack-book-three"><small>JARDÍN<br />SECRETO</small><span>✿</span></div>
          <div className="table-line" />
        </div>
      </section>
      <section className="section-heading">
        <div><span className="eyebrow">SELECCIÓN DE LA CASA</span><h2>{isAdmin ? "Vista de administración" : "Lecturas que recomendamos"}</h2></div>
        {status === "authenticated" && <Link href={ROUTES.books} className="text-link">Ver catálogo completo <span aria-hidden="true">→</span></Link>}
      </section>
      {status === "loading" && <p className="status-panel">Comprobando sesión…</p>}
      {status === "unauthenticated" && <div className="callout"><p>Inicia sesión para explorar nuestra colección.</p><Link href={ROUTES.login} className="text-link">Ingresar <span aria-hidden="true">→</span></Link></div>}
      {error && <p className="feedback feedback-error" role="alert">{error}</p>}
      {status === "authenticated" && <BookList books={books.slice(0, 3)} />}
      {isAdmin && <p className="admin-note">Cuenta administradora · <Link href={ROUTES.admin}>Gestionar catálogo →</Link></p>}
    </>
  );
}
