import { useEffect, useState, type FormEvent } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { FormField } from "@/components/FormField";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/api";
import { validateProfile } from "@/lib/validation";
import type { Profile, ProfileUpdateInput } from "@/types/profile";

export default function ProfilePage() {
  const { user, status } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileUpdateInput>({ full_name: "", phone: "", address: "" });
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchApi<Profile>("/profile/me", { auth: true }).then((data) => { setProfile(data); setForm({ full_name: data.full_name, phone: data.phone ?? "", address: data.address ?? "" }); }).catch((reason: Error) => setError(reason.message));
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess("");
    const validationError = validateProfile(form);
    if (validationError) { setError(validationError); return; }
    setBusy(true);
    try { const updated = await fetchApi<Profile>("/profile/me", { method: "PUT", auth: true, body: form }); setProfile(updated); setSuccess("Tus datos se guardaron correctamente."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo guardar el perfil."); }
    finally { setBusy(false); }
  }

  return <AuthGuard><section className="page-heading"><span className="eyebrow">TU ESPACIO PERSONAL</span><h1>Mi perfil</h1><p>Actualiza tus datos para que podamos conocerte mejor.</p></section><div className="profile-layout"><aside className="profile-summary"><div className="avatar-mark">{(profile?.full_name || user?.email || "L").charAt(0).toUpperCase()}</div><h2>{profile?.full_name || "Cargando perfil…"}</h2><p>{user?.email}</p>{profile?.bio && <blockquote>{profile.bio}</blockquote>}</aside><section className="profile-form-card"><h2>Datos personales</h2>{error && <FeedbackMessage message={error} />}{success && <FeedbackMessage message={success} kind="success" />}{!profile && !error ? <p className="status-panel">Cargando perfil…</p> : <form onSubmit={handleSubmit} noValidate>
    <FormField label="Nombre completo" name="full_name" maxLength={100} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
    <FormField label="Teléfono" name="phone" type="tel" maxLength={30} value={form.phone ?? ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
    <FormField label="Dirección" name="address" maxLength={250} value={form.address ?? ""} onChange={(event) => setForm({ ...form, address: event.target.value })} />
    <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"} <span aria-hidden="true">→</span></button>
  </form>}</section></div></AuthGuard>;
}
