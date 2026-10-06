const TOKEN_KEY = "library_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAccessToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}
