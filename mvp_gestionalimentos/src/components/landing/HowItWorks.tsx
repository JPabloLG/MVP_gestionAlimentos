"use client";

import React from "react";
import { Card } from "@/components/ui/Card";

const steps = [
  { num: "1", title: "Registra", desc: "Agrega lo que tienes en tu nevera o despensa" },
  { num: "2", title: "Monitorea", desc: "Ve con semáforo qué está por vencer" },
  { num: "3", title: "Cocina", desc: "Aprovecha con recetas que rescatan lo urgente" },
];

export function HowItWorks() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display text-center mb-8">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <Card key={s.num}>
              <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-semibold mb-3">
                {s.num}
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-ink-muted">{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
