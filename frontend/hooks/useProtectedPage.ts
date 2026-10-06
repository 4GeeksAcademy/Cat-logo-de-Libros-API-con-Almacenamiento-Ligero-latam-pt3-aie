import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";
import type { UserRole } from "@/types/auth";

export function useProtectedPage(requiredRole?: UserRole) {
  const auth = useAuth();
  const router = useRouter();
  const authorized = auth.status === "authenticated" && (!requiredRole || auth.user?.role === requiredRole);

  useEffect(() => {
    if (!router.isReady || auth.status === "loading") return;
    if (auth.status === "unauthenticated") void router.replace(ROUTES.login);
    else if (requiredRole && auth.user?.role !== requiredRole) void router.replace(ROUTES.books);
  }, [auth.status, auth.user?.role, requiredRole, router]);

  return { ...auth, authorized };
}
