import type { ReactNode } from "react";
import { useProtectedPage } from "@/hooks/useProtectedPage";
import type { UserRole } from "@/types/auth";

export function AuthGuard({ children, role }: { children: ReactNode; role?: UserRole }) {
  const { status, authorized } = useProtectedPage(role);
  if (status === "loading" || !authorized) return <p className="status-panel" role="status">Comprobando tu sesión…</p>;
  return <>{children}</>;
}
