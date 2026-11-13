"use client";

import React, { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { DemoAccessCard } from "@/components/auth/DemoAccessCard";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Check, ChefHat, Clock3, Leaf, Sparkles, UserRound } from "lucide-react";

export default function LoginPage() {
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
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_15%_10%,rgba(196,220,199,0.5),transparent_38%),radial-gradient(ellipse_at_85%_90%,rgba(244,163,64,0.1),transparent_38%),#F7F6F2] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_-36px_rgba(31,42,36,0.24)] sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1fr_0.95fr]">
        <section className="flex flex-col px-6 py-7 sm:px-12 lg:px-16 lg:py-10">
          <div className="flex items-center justify-between">
            <Logo />
            <Link href="/" className="text-sm font-medium text-ink-muted transition hover:text-primary">
              Volver al inicio
            </Link>
          </div>
          <div className="mx-auto my-auto w-full max-w-md py-12">
            <div className="mb-8">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold tracking-wide text-primary">
                <Leaf size={14} /> TU COCINA, MÁS CONSCIENTE
              </span>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">Qué bueno verte</h1>
              <p className="text-ink-muted">Inicia sesión y sigue aprovechando cada ingrediente.</p>
            </div>
            <div className="mb-5">
              <DemoAccessCard />
            </div>
            <LoginForm />
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-ink-muted">o continúa rápido</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full border-emerald-800 bg-emerald-800 text-black hover:bg-emerald-900 hover:text-black"
              onClick={handleDemoLogin}
              disabled={isDemoLoading}
            >
              {isDemoLoading ? "Preparando tu cocina..." : "Entrar con Cuenta Demo (1 clic)"}
              {!isDemoLoading && <UserRound size={17} />}
            </Button>
            {demoError && <p role="alert" className="mt-3 text-sm text-expired">{demoError}</p>}
            <p className="mt-3 text-center text-xs leading-relaxed text-ink-muted">
              Entra con alimentos de ejemplo y descubre cómo funciona, sin registrarte.
            </p>
            <p className="mt-8 text-center text-sm text-ink-muted">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/registro" className="font-semibold text-primary hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
          <p className="text-center text-xs text-ink-muted">Hecho con cariño para que ningún alimento se pierda.</p>
        </section>

        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#1F5A41] p-10 text-white lg:flex xl:p-14">
          <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-[#2E7D5B]/70 blur-2xl" />
          <div className="relative flex items-center gap-2 text-sm font-medium text-white/75">
            <Sparkles size={16} className="text-[#F4C76A]" /> Pequeños hábitos, grandes cambios
          </div>
          <div className="relative mx-auto w-full max-w-lg py-10">
            <h2 className="mb-4 text-4xl font-semibold leading-tight xl:text-5xl">
              Lo que tienes hoy puede convertirse en algo delicioso.
            </h2>
            <p className="mb-10 max-w-md leading-relaxed text-white/70">
              Organiza tus alimentos, descubre qué usar primero y encuentra inspiración para cocinar.
            </p>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/10 backdrop-blur-md">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Tu cocina hoy</p>
                  <p className="mt-1 text-xs text-white/60">Un vistazo a lo que tienes</p>
                </div>
                <span className="rounded-full bg-[#F4C76A]/15 px-3 py-1 text-xs font-medium text-[#FFE19A]">
                  Todo bajo control
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4C76A]/15 text-2xl">🥑</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Aguacate</p>
                    <p className="text-xs text-white/60">Úsalo hoy</p>
                  </div>
                  <Clock3 size={17} className="text-[#FFE19A]" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-2xl">🍅</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Tomates</p>
                    <p className="text-xs text-white/60">Frescos por 4 días más</p>
                  </div>
                  <Check size={18} className="text-[#9BE0B5]" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F4C76A] p-3.5 text-[#3A3829]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/40">
                  <ChefHat size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-65">Una idea para hoy</p>
                  <p className="text-sm font-bold">Tostadas frescas con aguacate</p>
                </div>
              </div>
            </div>
          </div>
          <p className="relative text-xs text-white/50">Menos desperdicio. Más sabor. 🌱</p>
        </aside>
      </div>
    </main>
  );
}
