"use client";

import React from "react";
import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { RecipeInsight } from "@/lib/recipes";
import { getExpiryLabel } from "@/lib/expiry";
import { Card } from "@/components/ui/Card";
import { RecipeImage } from "./RecipeImage";

export function RecipeCatalogCard({
  recipe,
  featured = false,
}: {
  recipe: RecipeInsight;
  featured?: boolean;
}) {
  const urgentFood = recipe.urgentFoods[0];

  return (
    <Link href={`/recetas/${recipe.id}`} className="group block h-full">
      <Card className={`h-full overflow-hidden p-0 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${
        featured
          ? "border-amber-200/80 shadow-md shadow-amber-900/5 group-hover:shadow-amber-900/10"
          : "border-transparent group-hover:border-primary/15 group-hover:shadow-primary/5"
      }`}>
        <div className={`relative w-full overflow-hidden ${featured ? "aspect-[16/10]" : "aspect-video"}`}>
          <RecipeImage recipeId={recipe.id} title={recipe.title} emoji={recipe.emoji} className="h-full w-full" />
          {urgentFood ? (
            <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-xs font-bold leading-tight text-amber-900 shadow-sm">
              ⚡ Salva tu {urgentFood.foodName} · {getExpiryLabel(urgentFood.daysRemaining).toLocaleLowerCase("es")}
            </span>
          ) : recipe.readyToCook ? (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              ✓ Lista para cocinar
            </span>
          ) : (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-muted backdrop-blur">
              Para inspirarte
            </span>
          )}
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {recipe.difficulty === "facil" ? "Fácil" : "Media"}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-semibold leading-snug">{recipe.title}</h3>
          <p className="mb-4 mt-1 line-clamp-2 min-h-10 text-sm leading-relaxed text-ink-muted">
            {recipe.description}
          </p>
          <div className="mb-3 flex items-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1"><Clock size={14} />{recipe.timeMinutes} min</span>
            <span className="flex items-center gap-1"><Users size={14} />{recipe.servings} porciones</span>
            <span className="ml-auto font-medium text-ink-muted">{recipe.matchedIngredients} de {recipe.requiredIngredients} ingredientes</span>
          </div>
          <div
            role="progressbar"
            aria-label={`${recipe.matchedIngredients} de ${recipe.requiredIngredients} ingredientes disponibles`}
            aria-valuemin={0}
            aria-valuemax={recipe.requiredIngredients}
            aria-valuenow={recipe.matchedIngredients}
            className="h-1.5 overflow-hidden rounded-full bg-emerald-100"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width]"
              style={{ width: `${Math.round(recipe.coverage * 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
