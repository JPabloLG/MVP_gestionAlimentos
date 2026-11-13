"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/config/site";
import { ArrowDown, ArrowRight, ChefHat, Clock3, Leaf, Sparkles } from "lucide-react";

export function Hero() {
  const reduced = useReducedMotionSafe();
  const { loginDemo } = useAuth();
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await loginDemo();
      router.push("/dashboard");
    } catch {
      setIsDemoLoading(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#F7F8F3]">
      <div className="pointer-events-none absolute -left-48 top-20 -z-10 h-96 w-96 rounded-full bg-[#E3F2EA] blur-3xl" />
      <div className="pointer-events-none absolute -right-36 -top-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#FDF0DC] blur-3xl" />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#beneficios" className="text-sm font-medium text-ink-muted transition hover:text-primary">Beneficios</a>
          <a href="#como-funciona" className="text-sm font-medium text-ink-muted transition hover:text-primary">Cómo funciona</a>
          <a href="#resenas" className="text-sm font-medium text-ink-muted transition hover:text-primary">Reseñas</a>
        </nav>
        <Link href="/login" className="text-sm font-semibold text-primary transition hover:text-primary-dark">
          Iniciar sesión <span aria-hidden="true">→</span>
        </Link>
      </header>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 md:pb-28 md:pt-16 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 12 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <Leaf size={15} /> Un hogar más sostenible empieza aquí
            </span>
          </motion.div>
          <motion.h1
            initial={reduced ? {} : { opacity: 0, y: 18 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mb-5 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
          >
            Menos desperdicio, <span className="text-primary">más sabor.</span>
          </motion.h1>
          <motion.p
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-ink-muted md:text-xl lg:mx-0"
          >
            {siteConfig.slogan} Organiza tu inventario y encuentra ideas deliciosas para aprovecharlo.
          </motion.p>
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 14 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="flex flex-wrap justify-center gap-3 lg:justify-start"
          >
            <Link href="/registro">
              <Button size="lg">Empieza gratis <ArrowRight size={17} /></Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={handleDemoLogin} disabled={isDemoLoading}>
              {isDemoLoading ? "Preparando demo..." : "Explorar la demo"}
            </Button>
          </motion.div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-ink-muted lg:justify-start">
            <span className="inline-flex items-center gap-1.5"><span className="text-fresh">●</span> Gratis para empezar</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-fresh">●</span> Sin tarjeta de crédito</span>
          </div>
        </div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 24, scale: 0.98 }}
          animate={reduced ? {} : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute -left-7 top-16 z-10 hidden -rotate-6 items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-ink/10 sm:flex">
            <span className="text-2xl">🥑</span>
            <div><p className="text-xs font-bold">Aguacate</p><p className="text-[11px] text-critical">Úsalo hoy</p></div>
          </div>
          <div className="absolute -right-3 bottom-14 z-10 hidden rotate-3 items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-ink/10 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-primary"><ChefHat size={19} /></span>
            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Idea del día</p><p className="text-xs font-bold">Tostadas frescas</p></div>
          </div>
          <div className="rounded-[2rem] bg-[#245F46] p-5 shadow-[0_30px_80px_-30px_rgba(31,90,65,0.6)] sm:p-7">
            <div className="mb-6 flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-semibold">Tu cocina</p>
                <p className="mt-1 text-xs text-white/60">Un vistazo a lo que tienes</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10"><Sparkles size={18} className="text-[#F4C76A]" /></span>
            </div>
            <div className="space-y-3">
              {[
                { emoji: "🥑", name: "Aguacate", detail: "Úsalo hoy", color: "text-[#FFD47C]", dot: "bg-[#F4A340]" },
                { emoji: "🍅", name: "Tomates", detail: "Frescos por 4 días", color: "text-[#A7E4B7]", dot: "bg-[#78C88F]" },
                { emoji: "🥬", name: "Espinaca", detail: "Fresca por 6 días", color: "text-white/70", dot: "bg-white/60" },
              ].map((food) => (
                <div key={food.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-3.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-2xl">{food.emoji}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{food.name}</p><p className={`mt-0.5 text-xs ${food.color}`}>{food.detail}</p></div>
                  <span className={`h-2.5 w-2.5 rounded-full ${food.dot}`} />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-[#F4C76A] p-4 text-[#3A3829]">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-70"><Clock3 size={14} /> Para rescatar hoy</div>
              <p className="font-display text-lg font-semibold">Tostadas de aguacate y tomate</p>
              <p className="mt-1 text-xs opacity-70">Lista en 15 minutos · aprovecha 2 ingredientes</p>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs text-white/60">
              <span>Tu inventario, en orden</span><ArrowDown size={15} />
            </div>
          </div>
          <div className="absolute -bottom-8 -left-4 -z-10 h-32 w-32 rounded-full bg-[#F4C76A]/60 blur-2xl" />
        </motion.div>
      </div>
      <div className="overflow-hidden border-y border-[#1F5A41]/10 bg-white/70 py-4">
        <motion.div
          className="flex w-max items-center gap-8 whitespace-nowrap px-4 text-xs font-bold uppercase tracking-[0.18em] text-primary/75 sm:gap-12 sm:text-sm"
          animate={reduced ? undefined : { x: ["0%", "-50%"] }}
          transition={reduced ? undefined : { duration: 32, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        >
          {[0, 1].map((repeat) => (
            <span key={repeat} className="flex items-center gap-8 sm:gap-12">
              <span>Revisa lo que tienes</span><span className="text-[#F4A340]">✳</span>
              <span>Aprovecha cada ingrediente</span><span className="text-[#F4A340]">✳</span>
              <span>Cocina algo delicioso</span><span className="text-[#F4A340]">✳</span>
              <span>Cuida tu bolsillo y el planeta</span><span className="text-[#F4A340]">✳</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
