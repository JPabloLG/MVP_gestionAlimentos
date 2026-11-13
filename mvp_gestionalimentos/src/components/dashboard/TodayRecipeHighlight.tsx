"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useRecipes } from "@/hooks/useRecipes";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { recipes } from "@/data/recipes";

export function TodayRecipeHighlight() {
  const { recommendations } = useRecipes();
  const best = recommendations.find((r) => r.section === "rescue") || recommendations[0] || recipes[10];

  const matchedRecipe = recommendations.some((recipe) => recipe.id === best.id);

  return (
    <Card className="relative isolate overflow-hidden border-0 bg-[#F4C76A] p-6">
      <div className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full border border-[#3A3829]/10" />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#3A3829]/70">Hoy cocina con…</h2>
        <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-[#3A3829]">{matchedRecipe ? "De tu inventario" : "Idea del día"}</span>
      </div>
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/40 text-3xl">{best.emoji}</span>
          <h3 className="text-xl font-semibold text-[#3A3829]">{best.title}</h3>
        </div>
        <p className="text-sm text-[#3A3829]/70 mb-4">{best.description}</p>
        <div className="flex gap-4 text-sm text-[#3A3829]/70 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {best.timeMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users size={16} />
            {best.servings} porciones
          </span>
        </div>
        {matchedRecipe && "usedFoods" in best && <p className="text-sm mb-3 text-[#3A3829]"><span className="font-semibold">Usa:</span> {best.usedFoods.map((uf) => uf.foodName).join(", ")}</p>}
      </div>
      <Link href={`/recetas/${best.id}`}>
        <Button className="w-full bg-[#1F5A41] text-white shadow-none hover:bg-[#174631]">Ver receta completa</Button>
      </Link>
    </Card>
  );
}
