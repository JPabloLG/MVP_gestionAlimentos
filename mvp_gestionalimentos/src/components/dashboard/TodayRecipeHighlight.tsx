"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useRecipes } from "@/hooks/useRecipes";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

export function TodayRecipeHighlight() {
  const { recommendations } = useRecipes();
  const best = recommendations.find((r) => r.section === "rescue") || recommendations[0];

  if (!best) {
    return (
      <Card>
        <h2 className="text-lg font-semibold mb-2">Hoy cocina con…</h2>
        <p className="text-ink-muted text-sm">Agrega alimentos para recibir recomendaciones.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-3">Hoy cocina con…</h2>
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{best.emoji}</span>
          <h3 className="text-xl font-semibold">{best.title}</h3>
        </div>
        <p className="text-ink-muted text-sm mb-3">{best.description}</p>
        <div className="flex gap-4 text-sm text-ink-muted mb-3">
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {best.timeMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users size={16} />
            {best.servings} porciones
          </span>
        </div>
        <p className="text-sm mb-2">
          <span className="font-medium">Usa:</span>{" "}
          {best.usedFoods.map((uf) => uf.foodName).join(", ")}
        </p>
      </div>
      <Link href={`/recetas/${best.id}`}>
        <Button className="w-full">Ver receta completa</Button>
      </Link>
    </Card>
  );
}
