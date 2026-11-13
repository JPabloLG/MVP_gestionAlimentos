"use client";

/**
 * Recipe detail (RF-10). Ingredient availability comes from the same engine
 * as the recommendation list, so both screens always agree.
 */
import React from "react";
import { notFound, useParams } from "next/navigation";
import { recipes } from "@/data/recipes";
import { Card } from "@/components/ui/Card";
import { useFoods } from "@/hooks/useFoods";
import { analyzeRecipe } from "@/lib/recipes";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";
import Link from "next/link";

const difficultyLabel = { facil: "Fácil", media: "Media" } as const;

export default function RecetaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const recipe = recipes.find((r) => r.id === id);
  const { foods } = useFoods();

  if (!recipe) notFound();

  const analysis = analyzeRecipe(recipe, foods);
  const have = analysis.ingredientMatches.filter((m) => m.food);
  const missing = analysis.ingredientMatches.filter((m) => !m.food);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/recetas" className="flex items-center gap-2 text-ink-muted hover:text-primary">
        <ArrowLeft size={18} />
        Volver a recetas
      </Link>

      <Card>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{recipe.emoji}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-display">{recipe.title}</h1>
            <p className="text-ink-muted">{recipe.description}</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-ink-muted">
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {recipe.timeMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users size={16} />
            {recipe.servings} porciones
          </span>
          <span className="flex items-center gap-1">
            <ChefHat size={16} />
            {difficultyLabel[recipe.difficulty]}
          </span>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Ingredientes</h2>
        {have.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-ink-muted mb-2">Ya tienes</h3>
            <ul className="space-y-2 mb-4">
              {have.map((ing) => (
                <li key={ing.key} className="flex items-center gap-2 flex-wrap">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-fresh-soft text-ink" aria-hidden="true">
                    ✓
                  </span>
                  <span>
                    {ing.label}
                    {ing.optional && <span className="text-xs ml-1">(opcional)</span>}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {missing.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-ink-muted mb-2">Te falta</h3>
            <ul className="space-y-2">
              {missing.map((ing) => (
                <li key={ing.key} className="flex items-center gap-2 text-ink-muted">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-surface-muted" aria-hidden="true">
                    ○
                  </span>
                  <span>
                    {ing.label}
                    {ing.optional && <span className="text-xs ml-1">(opcional)</span>}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Pasos</h2>
        <ol className="space-y-3">
          {recipe.steps.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 font-medium">
                {idx + 1}
              </span>
              <p className="pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
