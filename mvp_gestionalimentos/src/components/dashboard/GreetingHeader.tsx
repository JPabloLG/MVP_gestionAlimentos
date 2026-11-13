"use client";

import React, { useState } from "react";
import { useGreeting } from "@/hooks/useGreeting";
import { Button } from "@/components/ui/Button";
import { formatDateES } from "@/lib/format";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import Link from "next/link";

export function GreetingHeader() {
  const { fullGreeting } = useGreeting();
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();

  return (
    <>
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#1F5A41] px-6 py-7 text-white shadow-[0_24px_60px_-32px_rgba(31,90,65,0.65)] sm:px-9 sm:py-9">
        <div className="pointer-events-none absolute -right-14 -top-32 -z-10 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-36 right-24 -z-10 h-72 w-72 rounded-full bg-primary blur-3xl" />
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
              <Sparkles size={14} className="text-[#F4C76A]" /> TU RESUMEN DE HOY
            </span>
            <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">{fullGreeting}</h1>
            <p className="capitalize text-white/65">{formatDateES(today)}</p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80">
              Cada ingrediente cuenta. Revisa lo que tienes y encuentra algo rico para preparar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsOpen(true)} className="bg-[#F4C76A] text-[#3A3829] shadow-none hover:bg-[#F8D889]">
              <Leaf size={17} /> Agregar alimento
            </Button>
            <Link href="/recetas">
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                Ver recetas <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <FoodFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
