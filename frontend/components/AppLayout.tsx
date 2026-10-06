import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-container">{children}</main>
      <footer className="site-footer">Una buena historia siempre encuentra su lector.</footer>
    </div>
  );
}
