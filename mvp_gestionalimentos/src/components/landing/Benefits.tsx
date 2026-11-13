"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Clock, ChefHat, Heart, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const benefits = [
  {
    icon: Clock,
    title: "Avisos oportunos",
    description: "Semáforo claro para saber qué está por vencer",
  },
  {
    icon: ChefHat,
    title: "Recetas inteligentes",
    description: "Recomendaciones que aprovechan primero lo más urgente",
  },
  {
    icon: Heart,
    title: "Menos desperdicio",
    description: "Cuida tu bolsillo y cuida el planeta",
  },
];

export function Benefits() {
  const reduced = useReducedMotionSafe();

  return (
    <section id="beneficios" className="px-4 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Una cocina más inteligente</p>
            <h2 className="max-w-xl text-3xl font-semibold leading-tight md:text-4xl">Todo lo que necesitas para aprovechar más.</h2></div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">Menos olvidos en la nevera y más ideas para disfrutar lo que ya compraste.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={reduced ? undefined : { opacity: 0, y: 22 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: reduced ? 0 : benefits.indexOf(b) * 0.1 }}
              >
              <Card className="group min-h-56 border-transparent bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/10 hover:shadow-xl hover:shadow-primary/5">
                <div className="mb-7 flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white"><Icon size={23} /></span>
                  <ArrowUpRight size={18} className="text-ink-muted/50 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{b.title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-ink-muted">{b.description}</p>
              </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
