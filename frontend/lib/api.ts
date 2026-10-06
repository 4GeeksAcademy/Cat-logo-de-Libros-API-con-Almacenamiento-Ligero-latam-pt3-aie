import { clearAccessToken, getAccessToken } from "./auth";
import type { ApiErrorBody } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  handleUnauthorized?: boolean;
}

function messageFromBody(body: ApiErrorBody | null, fallback: string): string {
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail)) {
    return body.detail.map((item) => item.msg).filter(Boolean).join("; ") || fallback;
  }
  return fallback;
}

export async function fetchApi<T>(path: string, options: ApiOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new Error("Falta configurar NEXT_PUBLIC_API_URL para conectar con la API.");
  }

  const { auth = false, handleUnauthorized = true, headers, body, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  if (auth) {
    const token = getAccessToken();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Inténtalo de nuevo.");
  }

  if (response.status === 204) return undefined as T;

  const responseBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
  if (!response.ok) {
    if (response.status === 401 && auth && handleUnauthorized && typeof window !== "undefined") {
      clearAccessToken();
      window.dispatchEvent(new Event("library:unauthorized"));
    }
    const error = new Error(messageFromBody(responseBody, `Error de API (${response.status}).`)) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  return responseBody as T;
}
