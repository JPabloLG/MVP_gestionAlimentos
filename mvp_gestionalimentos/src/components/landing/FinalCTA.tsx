"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="px-4 pb-20 pt-4 md:pb-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1F5A41] px-6 py-14 text-center text-white sm:px-12 md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-40 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-primary blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80"><Leaf size={14} /> Empieza hoy, a tu ritmo</span>
        <h2 className="mb-4 text-3xl font-semibold md:text-5xl">Dale una segunda vida a lo que ya tienes.</h2>
        <p className="mb-7 text-white/70">
          Crea tu cuenta gratis y empieza a cocinar con lo que hay en casa.
        </p>
        <Link href="/registro">
          <Button size="lg" className="bg-[#F4C76A] text-[#3A3829] shadow-none hover:bg-[#F8D889]">Crear cuenta gratis <ArrowRight size={17} /></Button>
        </Link>
        </div>
      </div>
    </section>
  );
}
