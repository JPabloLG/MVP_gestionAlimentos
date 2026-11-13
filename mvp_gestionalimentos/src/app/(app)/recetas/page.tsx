"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { buttonClasses } from "@/components/ui/Button";
import { Flame, Utensils } from "lucide-react";

/** All recommendations, split in the two sections defined by RN-06. */
export default function RecetasPage() {
  const { recommendations } = useRecipes();
  const rescue = recommendations.filter((r) => r.section === "rescue");
  const withWhat = recommendations.filter((r) => r.section === "withwhatyouhave");

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-accent-soft to-primary-soft p-5 sm:p-6">
        <Image src="/illustrations/cooking.svg" alt="" width={240} height={180} className="w-24 sm:w-32 h-auto shrink-0" />
        <div>
          <h1 className="text-2xl md:text-3xl font-display mb-1">Recetas recomendadas</h1>
          <p className="text-ink-muted text-sm sm:text-base">
            Elegidas según lo que tienes, empezando por lo que está por vencer.
          </p>
        </div>
      </header>

      {rescue.length > 0 && (
        <section aria-labelledby="rescate">
          <h2 id="rescate" className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Flame size={20} className="text-critical-ink" aria-hidden="true" />
            Para rescatar hoy
          </h2>
          <p className="text-sm text-ink-muted mb-4">Usan alimentos que vencen en 5 días o menos.</p>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-4">
            {rescue.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {withWhat.length > 0 && (
        <section aria-labelledby="con-lo-que-tienes">
          <h2 id="con-lo-que-tienes" className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Utensils size={20} className="text-primary" aria-hidden="true" />
            Con lo que tienes
          </h2>
          <p className="text-sm text-ink-muted mb-4">Tienes al menos el 60 % de los ingredientes.</p>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-4">
            {withWhat.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {recommendations.length === 0 && (
        <div className="text-center bg-surface rounded-2xl border border-dashed border-border p-8">
          <Image src="/illustrations/empty.svg" alt="" width={220} height={170} className="mx-auto w-40 h-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Aún no hay recetas para ti</h2>
          <p className="text-ink-muted mb-5 max-w-md mx-auto">
            Agrega alimentos (o carga los de ejemplo) y te mostraremos qué cocinar con ellos.
          </p>
          <Link href="/inventario" className={buttonClasses("primary", "md")}>
            Ir al inventario
          </Link>
        </div>
      )}
    </div>
  );
}
