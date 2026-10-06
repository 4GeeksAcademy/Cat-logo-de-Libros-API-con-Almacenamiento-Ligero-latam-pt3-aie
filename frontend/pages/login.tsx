import Link from "next/link";
import { useState, type FormEvent } from "react";
import { GuestGuard } from "@/components/GuestGuard";
import { FormField } from "@/components/FormField";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail } from "@/lib/validation";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const validationError = validateEmail(email) ?? (!password ? "La contraseña es obligatoria." : null);
    if (validationError) { setError(validationError); return; }
    setBusy(true);
    try { await login({ email: email.trim(), password }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesión."); }
    finally { setBusy(false); }
  }

  return <GuestGuard><div className="auth-layout"><div className="auth-aside"><span className="eyebrow">QUÉ BUENO TENERTE DE VUELTA</span><h1>Las historias<br /><em>te esperaban.</em></h1><p>Entra y continúa descubriendo lecturas hechas para quedarse contigo.</p><div className="aside-mark">✦</div></div><section className="auth-card"><span className="eyebrow">TU ESPACIO DE LECTURA</span><h2>Iniciar sesión</h2><p className="muted">Ingresa tus datos para continuar.</p><form onSubmit={handleSubmit} noValidate>
    {error && <FeedbackMessage message={error} />}
    <FormField label="Correo electrónico" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
    <FormField label="Contraseña" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
    <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? "Ingresando…" : "Ingresar"} <span aria-hidden="true">→</span></button>
  </form><p className="form-switch">¿Primera vez por aquí? <Link href="/signup">Crea tu cuenta</Link></p></section></div></GuestGuard>;
}
