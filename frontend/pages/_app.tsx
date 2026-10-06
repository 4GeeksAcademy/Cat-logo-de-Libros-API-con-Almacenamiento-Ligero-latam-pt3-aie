import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppLayout><Component {...pageProps} /></AppLayout>
    </AuthProvider>
  );
}
