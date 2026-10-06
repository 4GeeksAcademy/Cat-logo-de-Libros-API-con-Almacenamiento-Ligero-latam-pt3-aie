import type { BookCreateInput } from "@/types/book";
import type { ProfileUpdateInput } from "@/types/profile";

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "El email es obligatorio.";
  if (email.length < 3 || email.length > 254) return "El email debe tener entre 3 y 254 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Introduce un email válido.";
  return null;
}

export function validateSignup(username: string, email: string, password: string): string | null {
  if (username.trim().length < 1 || username.trim().length > 50) return "El nombre de usuario debe tener entre 1 y 50 caracteres.";
  const emailError = validateEmail(email);
  if (emailError) return emailError;
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  return null;
}

export function validateProfile(input: ProfileUpdateInput): string | null {
  if (!input.full_name.trim() || input.full_name.trim().length > 100) return "El nombre completo es obligatorio y debe tener hasta 100 caracteres.";
  if ((input.phone?.length ?? 0) > 30) return "El teléfono debe tener hasta 30 caracteres.";
  if ((input.address?.length ?? 0) > 250) return "La dirección debe tener hasta 250 caracteres.";
  return null;
}

export function validateBook(input: BookCreateInput): string | null {
  if (!input.title.trim()) return "El título es obligatorio.";
  if (!input.author.trim()) return "El autor es obligatorio.";
  if (!Number.isInteger(input.pages) || input.pages < 1) return "Las páginas deben ser un entero mayor que cero.";
  return null;
}
