import Link from "next/link";
import { useState, type FormEvent } from "react";
import { GuestGuard } from "@/components/GuestGuard";
import { FormField } from "@/components/FormField";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { useAuth } from "@/hooks/useAuth";
import { validateSignup } from "@/lib/validation";

export default function SignupPage() {
  const { signup } = useAuth();
  const [username, setUsername] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess("");
    const validationError = validateSignup(username, email, password);
    if (validationError) { setError(validationError); return; }
    setBusy(true);
    try { await signup({ username: username.trim(), email: email.trim(), password }); setSuccess("Tu cuenta está lista. Inicia sesión para continuar."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo crear la cuenta."); }
    finally { setBusy(false); }
  }

  return <GuestGuard><div className="auth-layout"><div className="auth-aside signup-aside"><span className="eyebrow">EMPIEZA UNA NUEVA HISTORIA</span><h1>Tu próxima<br /><em>lectura vive aquí.</em></h1><p>Crea tu cuenta y guarda un lugar para las historias que todavía no conoces.</p><div className="aside-mark">✿</div></div><section className="auth-card"><span className="eyebrow">BIENVENIDO A LUMBRE</span><h2>Crear cuenta</h2><p className="muted">Solo necesitas unos datos para empezar.</p><form onSubmit={handleSubmit} noValidate>
    {error && <FeedbackMessage message={error} />}{success && <FeedbackMessage message={success} kind="success" />}
    <FormField label="Nombre de usuario" name="username" autoComplete="username" maxLength={50} value={username} onChange={(event) => setUsername(event.target.value)} required />
    <FormField label="Correo electrónico" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required />
    <FormField label="Contraseña" name="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required hint="Al menos 8 caracteres." />
    <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? "Creando cuenta…" : "Crear cuenta"} <span aria-hidden="true">→</span></button>
  </form><p className="form-switch">¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p></section></div></GuestGuard>;
}
