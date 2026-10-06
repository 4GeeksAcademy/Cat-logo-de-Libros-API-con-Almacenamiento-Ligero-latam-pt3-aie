import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

export function Navbar() {
  const { status, user, logout } = useAuth();
  const authenticated = status === "authenticated";

  return (
    <header className="topbar">
      <nav className="nav-inner" aria-label="Navegación principal">
        <Link href={ROUTES.home} className="brand"><span aria-hidden="true">✦</span> Lumbre <small>LIBRERÍA</small></Link>
        <div className="nav-links">
          <Link href={ROUTES.books}>Catálogo</Link>
          {authenticated && <Link href={ROUTES.profile}>Mi perfil</Link>}
          {authenticated && user?.role === "admin" && <Link href={ROUTES.admin}>Administración</Link>}
          {!authenticated && status !== "loading" && <Link href={ROUTES.login}>Ingresar</Link>}
          {!authenticated && status !== "loading" && <Link href={ROUTES.signup} className="nav-cta">Crear cuenta</Link>}
          {authenticated && <button type="button" className="nav-button" onClick={logout}>Salir</button>}
        </div>
      </nav>
    </header>
  );
}
