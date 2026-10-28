"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useRecipes } from "@/hooks/useRecipes";
import Link from "next/link";
import { Clock } from "lucide-react";

export function RecipeSuggestions() {
  const { recommendations } = useRecipes();
  const recs = recommendations.slice(0, 4);

  if (recs.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-semibold mb-2">Recetas sugeridas</h2>
        <p className="text-ink-muted text-sm">Agrega más alimentos para ver sugerencias.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recetas sugeridas</h2>
        <Link href="/recetas" className="text-sm text-primary hover:underline">
          Ver todas
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recs.map((recipe) => (
          <Link key={recipe.id} href={`/recetas/${recipe.id}`}>
            <Card className="h-full hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{recipe.emoji}</span>
                <h3 className="font-semibold text-sm line-clamp-1">{recipe.title}</h3>
              </div>
              <p className="text-xs text-ink-muted mb-2 line-clamp-2">{recipe.description}</p>
              <div className="flex items-center gap-1 text-xs text-ink-muted">
                <Clock size={12} />
                {recipe.timeMinutes} min
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Card>
  );
}
