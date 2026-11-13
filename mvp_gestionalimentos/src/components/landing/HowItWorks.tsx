"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const steps = [
  { num: "1", title: "Registra", desc: "Agrega lo que tienes en tu nevera o despensa" },
  { num: "2", title: "Monitorea", desc: "Ve con semáforo qué está por vencer" },
  { num: "3", title: "Cocina", desc: "Aprovecha con recetas que rescatan lo urgente" },
];

export function HowItWorks() {
  const reduced = useReducedMotionSafe();

  return (
    <section id="como-funciona" className="bg-[#EEF3EA] px-4 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Así de fácil</p>
          <h2 className="mb-3 text-3xl font-semibold md:text-4xl">Del inventario a la mesa.</h2>
          <p className="text-ink-muted">Tres pasos sencillos para que nada se quede olvidado en el fondo de la nevera.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, index) => (
            <motion.div
              key={s.num}
              initial={reduced ? undefined : { opacity: 0, y: 22 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: reduced ? 0 : index * 0.12 }}
            >
            <Card className="relative h-full overflow-hidden border-white/70 bg-white/80 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg md:p-7">
              <span className="absolute -right-2 -top-8 font-display text-8xl font-semibold text-primary/[0.06]">{s.num}</span>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20">
                {s.num}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{s.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-ink-muted">{s.desc}</p>
            </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
