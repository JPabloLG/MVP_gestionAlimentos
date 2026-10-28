import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { FoodsProvider } from "@/context/FoodsProvider";
import { ToastProvider } from "@/context/ToastProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "GESTIONALO - Gestiona lo que tienes. Cocina antes de vencer.",
  description:
    "GESTIONALO te ayuda a gestionar los alimentos de tu hogar, avisarte qué está por vencer y recomendarte recetas para aprovecharlos.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${plusJakarta.variable} ${fraunces.variable} antialiased bg-background text-ink`}
      >
        <ToastProvider>
          <AuthProvider>
            <FoodsProvider>{children}</FoodsProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
