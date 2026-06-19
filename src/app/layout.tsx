import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaaS ERP Multiempresa",
  description: "Sistema Avanzado de Gestión y Facturación Electrónica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen antialiased text-foreground`}>
        <div className="google-ai-bg"></div>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
