import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

export function GuestGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") void router.replace("/profile");
  }, [status, router]);
  if (status === "loading" || status === "authenticated") return <p className="status-panel" role="status">Cargando…</p>;
  return <>{children}</>;
}
