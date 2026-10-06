import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { clearAccessToken, getAccessToken, saveAccessToken } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { AccessToken, CurrentUser, LoginInput, SignupInput } from "@/types/auth";
import type { User } from "@/types/user";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const router = useRouter();

  const loadCurrentUser = useCallback(async () => {
    return fetchApi<CurrentUser>("/auth/me", { auth: true, handleUnauthorized: false });
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      if (!getAccessToken()) {
        if (active) setStatus("unauthenticated");
        return;
      }
      try {
        const currentUser = await loadCurrentUser();
        if (active) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch {
        clearAccessToken();
        if (active) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    };
    void initialize();
    return () => { active = false; };
  }, [loadCurrentUser]);

  useEffect(() => {
    const onUnauthorized = () => {
      clearAccessToken();
      setUser(null);
      setStatus("unauthenticated");
      if (router.pathname !== ROUTES.login && router.pathname !== ROUTES.signup) {
        void router.replace(ROUTES.login);
      }
    };
    window.addEventListener("library:unauthorized", onUnauthorized);
    return () => window.removeEventListener("library:unauthorized", onUnauthorized);
  }, [router]);

  const login = useCallback(async (input: LoginInput) => {
    const token = await fetchApi<AccessToken>("/auth/login", { method: "POST", body: input });
    saveAccessToken(token.access_token);
    try {
      const currentUser = await loadCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
      await router.push(ROUTES.profile);
    } catch (error) {
      clearAccessToken();
      setUser(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, [loadCurrentUser, router]);

  const signup = useCallback(async (input: SignupInput) => {
    await fetchApi<User>("/users", { method: "POST", body: input });
    await router.push(ROUTES.login);
  }, [router]);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setStatus("unauthenticated");
    void router.push(ROUTES.home);
  }, [router]);

  const value = useMemo(() => ({ status, user, login, signup, logout }), [status, user, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
