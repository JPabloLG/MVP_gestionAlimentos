"use client";

import React from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

export default function RecetasPage() {
  const { recommendations } = useRecipes();
  const rescue = recommendations.filter((r) => r.section === "rescue");
  const withWhat = recommendations.filter((r) => r.section === "withwhatyouhave");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-display">Recetas recomendadas</h1>

      {rescue.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Para rescatar hoy</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rescue.map((recipe) => (
              <Link key={recipe.id} href={`/recetas/${recipe.id}`}>
                <Card className="h-full hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{recipe.emoji}</span>
                    <h3 className="font-semibold">{recipe.title}</h3>
                  </div>
                  <p className="text-sm text-ink-muted mb-3">{recipe.description}</p>
                  <div className="flex gap-3 text-xs text-ink-muted mb-2">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {recipe.timeMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {recipe.servings}
                    </span>
                  </div>
                  <p className="text-xs">
                    <span className="font-medium">Usa:</span> {recipe.usedFoods.map((uf) => uf.foodName).join(", ")}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {withWhat.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Con lo que tienes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {withWhat.map((recipe) => (
              <Link key={recipe.id} href={`/recetas/${recipe.id}`}>
                <Card className="h-full hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{recipe.emoji}</span>
                    <h3 className="font-semibold">{recipe.title}</h3>
                  </div>
                  <p className="text-sm text-ink-muted mb-3">{recipe.description}</p>
                  <div className="flex gap-3 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {recipe.timeMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {recipe.servings}
                    </span>
                  </div>
                  <p className="text-xs mt-2 text-ink-muted">
                    Cobertura: {Math.round(recipe.coverage * 100)}%
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recommendations.length === 0 && (
        <Card>
          <p className="text-ink-muted">
            No hay recetas recomendadas con tu inventario actual. Agrega más alimentos o carga
            ejemplos para ver sugerencias.
          </p>
        </Card>
      )}
    </div>
  );
}
