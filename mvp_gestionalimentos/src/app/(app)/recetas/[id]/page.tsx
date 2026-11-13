"use client";

import React from "react";
import { useParams } from "next/navigation";
import { recipes } from "@/data/recipes";
import { Card } from "@/components/ui/Card";
import { Button, buttonClasses } from "@/components/ui/Button";
import { matchesIngredient } from "@/lib/recipes";
import { parseStepMinutes } from "@/lib/cooking";
import { Clock, Users, ChefHat, ArrowLeft, Check, CookingPot, Flame, Timer, Lightbulb, ShoppingBasket, Play } from "lucide-react";
import Link from "next/link";
import { RecipeImage } from "@/components/recipes/RecipeImage";
import { getDaysRemaining } from "@/lib/expiry";
import { useCookRecipe } from "@/hooks/useCookRecipe";

export default function RecetaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const recipe = recipes.find((r) => r.id === id);
  const { foods, insight, isCooking, markCooked } = useCookRecipe(recipe);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl">🍽️</span>
        <p className="text-lg font-semibold">Receta no encontrada</p>
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

  const haveCount = recipe.ingredients.filter((ing) => hasIngredient(ing.key || ing.label)).length;
  const havePercent = Math.round((haveCount / recipe.ingredients.length) * 100);
  const urgentCount = insight?.usedFoods.filter((food) => food.daysRemaining <= 3).length ?? 0;
  const cookHref = `/cocinar/${recipe.id}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      <Link href="/recetas" className="inline-flex items-center gap-2 rounded-full px-1 text-sm font-medium text-ink-muted transition hover:text-primary">
        <ArrowLeft size={18} />
        Volver a recetas
      </Link>

      <section className="relative isolate overflow-hidden rounded-[2rem] bg-emerald-950 text-white shadow-xl shadow-emerald-950/10">
        <RecipeImage
          recipeId={recipe.id}
          title={recipe.title}
          emoji={recipe.emoji}
          priority
          className="h-72 w-full sm:h-80 lg:h-96"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <span aria-hidden className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur animate-float">
          {recipe.emoji}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <ChefHat size={14} /> Receta para disfrutar
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{recipe.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/80 sm:text-base">{recipe.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={cookHref} className={buttonClasses("primary", "lg", "bg-[#F4C76A] text-[#3A3829] shadow-lg shadow-black/20 hover:bg-[#F8D889]")}>
              <Play size={18} fill="currentColor" /> Empezar a cocinar
            </Link>
            <span className="text-xs text-white/70">Paso a paso con temporizador y alarma</span>
          </div>
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
        <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">
          <ShoppingBasket size={16} className="text-primary" /> {haveCount}/{recipe.ingredients.length} ingredientes en casa
        </span>
        {urgentCount > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
            <Flame size={16} /> Rescata {urgentCount} {urgentCount === 1 ? "alimento" : "alimentos"}
          </span>
        )}
        {recipe.tags?.map((tag) => (
          <span key={tag} className="inline-flex items-center rounded-full bg-surface-muted px-3 py-2 text-xs font-medium capitalize text-ink-muted">
            #{tag}
          </span>
        ))}
      </div>

      <Card className="border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 sm:flex"><CookingPot size={20} /></span>
            <div>
              <h2 className="font-semibold text-emerald-950">¿Ya preparaste esta receta?</h2>
              <p className="mt-1 text-sm text-emerald-900/75">
                {insight?.usedFoods.length
                  ? "Descontaremos un ingrediente por alimento, priorizando los que vencen primero."
                  : "Agrega ingredientes vigentes a tu inventario para poder descontarlos."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={markCooked}
            disabled={isCooking || !insight?.usedFoods.length}
            className="h-auto shrink-0 py-2.5 text-center"
          >
            {isCooking ? <CookingPot size={17} /> : <Check size={17} />}
            {isCooking ? "Actualizando..." : "Marcar como cocinada (Descontar del inventario)"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <div className="space-y-6 lg:sticky lg:top-24">
          <Card animate={false}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Ingredientes</h2>
              <span className="text-sm font-semibold text-primary">{havePercent}%</span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-muted" aria-label={`Tienes ${haveCount} de ${recipe.ingredients.length} ingredientes`}>
              <div className="h-full rounded-full bg-gradient-to-r from-fresh to-primary transition-all duration-500" style={{ width: `${havePercent}%` }} />
            </div>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, idx) => {
                const have = hasIngredient(ing.key || ing.label);
                return (
                  <li key={idx} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${have ? "bg-emerald-50/80" : ""}`}>
                    <span className="flex min-w-0 items-center gap-2">
                    <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-xs ${have ? "bg-fresh-soft text-fresh" : "bg-surface-muted text-ink-muted"}`}>
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

          <section className="relative overflow-hidden rounded-3xl border border-accent/30 bg-accent-soft p-5">
            <span aria-hidden className="absolute -bottom-6 -right-3 select-none text-7xl opacity-20">{recipe.emoji}</span>
            <div className="relative flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface"><Lightbulb size={20} className="text-accent" /></span>
              <div>
                <h2 className="font-semibold">Tip de cocina</h2>
                <p className="mt-1 text-sm text-ink/80">
                  Ten todos los ingredientes picados y a mano antes de empezar. En el modo cocina puedes marcarlos uno a uno.
                </p>
              </div>
            </div>
          </section>
        </div>

        <Card animate={false}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Pasos</h2>
            <Link href={cookHref} className={buttonClasses("secondary", "sm")}>
              <Timer size={16} className="text-primary" /> Modo cocina
            </Link>
          </div>
          <ol className="relative space-y-4">
            {recipe.steps.map((step, idx) => {
              const minutes = parseStepMinutes(step);
              return (
                <li key={idx} className="relative flex gap-3">
                  {idx < recipe.steps.length - 1 && (
                    <span aria-hidden className="absolute left-[13px] top-8 h-[calc(100%-1rem)] w-0.5 bg-primary-soft" />
                  )}
                  <span className="relative w-7 h-7 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 font-medium ring-4 ring-white">
                    {idx + 1}
                  </span>
                  <div className="pt-0.5">
                    <p>{step}</p>
                    {minutes && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                        <Timer size={12} /> ~{minutes} min
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <Link href={cookHref} className={buttonClasses("primary", "lg", "mt-6 w-full")}>
            <Play size={18} fill="currentColor" /> Empezar a cocinar paso a paso
          </Link>
        </Card>
      </div>
    </div>
  );
}
