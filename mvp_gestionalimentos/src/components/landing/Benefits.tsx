"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Clock, ChefHat, Heart } from "lucide-react";

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
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display text-center mb-8">Beneficios</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title}>
                <Icon className="text-primary mb-3" size={32} />
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-ink-muted">{b.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
