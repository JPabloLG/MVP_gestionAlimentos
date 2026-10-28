"use client";

import React from "react";
import { useParams } from "next/navigation";
import { recipes } from "@/data/recipes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useFoods } from "@/hooks/useFoods";
import { normalize } from "@/lib/recipes";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RecetaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const recipe = recipes.find((r) => r.id === id);
  const { foods } = useFoods();

  if (!recipe) {
    return (
      <div>
        <p>Receta no encontrada</p>
        <Link href="/recetas">
          <Button variant="secondary">Volver a recetas</Button>
        </Link>
      </div>
    );
  }

  const hasIngredient = (ingKey: string) => {
    const ingNorm = normalize(ingKey);
    return foods.some((f) => {
      const foodNorm = normalize(f.name);
      return foodNorm === ingNorm || foodNorm.includes(ingNorm) || ingNorm.includes(foodNorm);
    });
  };

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
            {recipe.difficulty}
          </span>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Ingredientes</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, idx) => {
            const have = hasIngredient(ing.key || ing.label);
            return (
              <li key={idx} className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${have ? "bg-fresh-soft text-fresh" : "bg-surface-muted text-ink-muted"}`}>
                  {have ? "✓" : "○"}
                </span>
                <span className={have ? "text-ink" : "text-ink-muted"}>
                  {ing.label}
                  {ing.optional && <span className="text-xs ml-1">(opcional)</span>}
                </span>
              </li>
            );
          })}
        </ul>
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
