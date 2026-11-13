"use client";

import React, { useEffect, useState } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { DemoAccessCard } from "@/components/auth/DemoAccessCard";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Leaf, Sparkles, UserRound } from "lucide-react";

export default function RegisterPage() {
  const { user, isLoading, loginDemo } = useAuth();
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleDemoLogin = async () => {
    setDemoError("");
    setIsDemoLoading(true);
    try {
      await loginDemo();
      router.push("/dashboard");
    } catch (error) {
      setDemoError(error instanceof Error ? error.message : "No se pudo iniciar la cuenta demo.");
      setIsDemoLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_15%_10%,rgba(196,220,199,0.5),transparent_38%),radial-gradient(ellipse_at_85%_90%,rgba(244,163,64,0.1),transparent_38%),#F7F6F2] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-7 flex items-center justify-between">
            <Logo />
            <Link href="/" className="text-sm font-medium text-ink-muted transition hover:text-primary">Volver al inicio</Link>
        </div>
        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xl shadow-ink/5 sm:p-9">
          <div className="mb-7">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold tracking-wide text-primary">
              <Leaf size={14} /> TU COCINA, MÁS CONSCIENTE
            </span>
            <h1 className="mb-2 text-3xl font-semibold tracking-tight">Crear cuenta</h1>
            <p className="text-ink-muted">Empieza a reducir el desperdicio y aprovecha mejor lo que tienes.</p>
          </div>
          <div className="mb-5">
            <DemoAccessCard />
          </div>
          <RegisterForm />
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-ink-muted">o continúa rápido</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="secondary" className="w-full border-emerald-800 bg-emerald-800 text-black hover:bg-emerald-900 hover:text-black" onClick={handleDemoLogin} disabled={isDemoLoading}>
            <Sparkles size={16} />
            {isDemoLoading ? "Preparando tu cocina..." : "Entrar con Cuenta Demo (1 clic)"}
            {!isDemoLoading && <UserRound size={16} />}
          </Button>
          {demoError && <p role="alert" className="mt-3 text-sm text-expired">{demoError}</p>}
        </section>
        <p className="mt-5 text-center text-sm text-ink-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}
