"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { recipes } from "@/data/recipes";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useFoods } from "@/hooks/useFoods";
import { getRecipeInsights, matchesIngredient } from "@/lib/recipes";
import { Clock, Users, ChefHat, ArrowLeft, Check, CookingPot } from "lucide-react";
import Link from "next/link";
import { RecipeImage } from "@/components/recipes/RecipeImage";
import { useToast } from "@/context/ToastProvider";
import { getDaysRemaining } from "@/lib/expiry";

export default function RecetaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const recipe = recipes.find((r) => r.id === id);
  const { foods, consumeFoods } = useFoods();
  const { showToast } = useToast();
  const [isCooking, setIsCooking] = useState(false);
  const insight = recipe ? getRecipeInsights(foods, [recipe])[0] : undefined;

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
    return foods.some(
      (food) =>
        getDaysRemaining(food.expiresAt) >= 0 &&
        matchesIngredient(ingKey, food.name)
    );
  };

  const handleCooked = async () => {
    if (!insight || insight.usedFoods.length === 0) return;
    setIsCooking(true);
    try {
      const consumedNames = await consumeFoods(insight.usedFoods.map((food) => food.foodId));
      if (consumedNames.length === 0) {
        showToast("No hay ingredientes vigentes en el inventario para descontar.", "info");
        return;
      }
      const uniqueNames = [...new Set(consumedNames)];
      const listedNames = uniqueNames.join(", ");
      const savedUrgentFood = insight.usedFoods.some((food) => food.daysRemaining <= 3);
      showToast(
        `¡Genial! Receta cocinada. Actualizaste ${listedNames} de tu inventario${savedUrgentFood ? " y aprovechaste alimentos próximos a vencer" : ""}.`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? `No se pudo actualizar el inventario: ${error.message}` : "No se pudo actualizar el inventario.",
        "error"
      );
    } finally {
      setIsCooking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/recetas" className="flex items-center gap-2 text-ink-muted hover:text-primary">
        <ArrowLeft size={18} />
        Volver a recetas
      </Link>

      <section className="relative isolate overflow-hidden rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/10">
        <RecipeImage
          recipeId={recipe.id}
          title={recipe.title}
          emoji={recipe.emoji}
          priority
          className="h-64 w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <ChefHat size={14} /> Receta para disfrutar
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{recipe.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/80 sm:text-base">{recipe.description}</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">
          <Clock size={16} className="text-primary" /> {recipe.timeMinutes} min
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">
          <Users size={16} className="text-primary" /> {recipe.servings} porciones
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          <ChefHat size={16} /> {recipe.difficulty === "facil" ? "Fácil" : "Media"}
        </span>
      </div>

      <Card className="border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-emerald-950">¿Ya preparaste esta receta?</h2>
            <p className="mt-1 text-sm text-emerald-900/75">
              {insight?.usedFoods.length
                ? "Descontaremos un ingrediente por alimento, priorizando los que vencen primero."
                : "Agrega ingredientes vigentes a tu inventario para poder descontarlos."}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCooked}
            disabled={isCooking || !insight?.usedFoods.length}
            className="shrink-0"
          >
            {isCooking ? <CookingPot size={17} /> : <Check size={17} />}
            {isCooking ? "Actualizando..." : "Marcar como cocinada"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Ingredientes</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, idx) => {
            const have = hasIngredient(ing.key || ing.label);
            return (
              <li key={idx} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${have ? "bg-emerald-50/80" : ""}`}>
                <span className="flex min-w-0 items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${have ? "bg-fresh-soft text-fresh" : "bg-surface-muted text-ink-muted"}`}>
                  {have ? "✓" : "○"}
                </span>
                <span className={have ? "text-ink" : "text-ink-muted"}>
                  {ing.label}
                  {ing.optional && <span className="text-xs ml-1">(opcional)</span>}
                </span>
                </span>
                {have && <span className="shrink-0 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-800">En tu inventario</span>}
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
