"use client";

import React from "react";
import Link from "next/link";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { ArrowRight, BookOpen } from "lucide-react";

/** Suggested recipes: swipeable row on phones, grid on larger screens. */
export function RecipeSuggestions() {
  const { recommendations } = useRecipes();
  const recs = recommendations.slice(0, 4);

  return (
    <section aria-labelledby="sugeridas">
      <div className="flex items-end justify-between gap-2 mb-3">
        <div>
          <h2 id="sugeridas" className="text-xl font-semibold flex items-center gap-2">
            <BookOpen size={20} className="text-primary" aria-hidden="true" />
            Recetas sugeridas
          </h2>
          <p className="text-sm text-ink-muted">Primero las que rescatan lo que está por vencer</p>
        </div>
        {recs.length > 0 && (
          <Link href="/recetas" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1 min-h-[44px] shrink-0">
            Ver todas <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>

      {recs.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-dashed border-border p-6 text-center text-sm text-ink-muted">
          Agrega alimentos a tu inventario para recibir sugerencias.{" "}
          <Link href="/inventario" className="text-primary font-medium hover:underline">
            Ir al inventario
          </Link>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
          {recs.map((recipe) => (
            <div key={recipe.id} className="snap-start shrink-0 w-[72%] sm:w-auto">
              <RecipeCard recipe={recipe} compact />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
