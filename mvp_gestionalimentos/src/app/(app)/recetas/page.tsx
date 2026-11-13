"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecipes } from "@/hooks/useRecipes";
import { Card } from "@/components/ui/Card";
import { ChefHat, Flame, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { RecipeCatalogCard } from "@/components/recipes/RecipeCatalogCard";
import { matchesIngredient } from "@/lib/recipes";

const categoryFilters = [
  { label: "Todas", tags: [] },
  { label: "Rápidas", tags: ["rapido"] },
  { label: "Desayunos", tags: ["desayuno"] },
  { label: "Comidas", tags: ["comida"] },
  { label: "Frescas", tags: ["fresco", "fruta"] },
  { label: "Tradicionales", tags: ["tradicional", "casero"] },
];

type QuickFilter = "all" | "ready" | "rescue";

export default function RecetasPage() {
  const { insights } = useRecipes();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Todas");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [ingredientFilter, setIngredientFilter] = useState("");

  useEffect(() => {
    const readIngredientFilter = () => {
      setIngredientFilter(new URLSearchParams(window.location.search).get("ingrediente")?.trim() ?? "");
    };
    readIngredientFilter();
    window.addEventListener("popstate", readIngredientFilter);
    return () => window.removeEventListener("popstate", readIngredientFilter);
  }, []);

  const clearIngredientFilter = () => {
    setIngredientFilter("");
    router.replace("/recetas", { scroll: false });
  };

  const categoryFilter = categoryFilters.find((filter) => filter.label === selectedFilter) ?? categoryFilters[0];
  const visibleRecipes = useMemo(() => {
    return insights.filter((recipe) => {
        const matchesSearch = `${recipe.title} ${recipe.description} ${recipe.tags?.join(" ") ?? ""} ${recipe.usedFoods.map((food) => food.foodName).join(" ")}`
          .toLocaleLowerCase("es")
          .includes(search.toLocaleLowerCase("es"));
        const matchesCategory = categoryFilter.tags.length === 0 || categoryFilter.tags.some((tag) => recipe.tags?.includes(tag));
        const matchesIngredient = !ingredientFilter || recipe.usedFoods.some((food) => matchesIngredientFilter(ingredientFilter, food.foodName));
        const matchesQuickFilter =
          quickFilter === "all" ||
          (quickFilter === "ready" && recipe.readyToCook) ||
          (quickFilter === "rescue" && recipe.urgentFoods.length > 0);
        return matchesSearch && matchesCategory && matchesIngredient && matchesQuickFilter;
      });
  }, [insights, search, categoryFilter, ingredientFilter, quickFilter]);
  const urgentRecipes = visibleRecipes.filter((recipe) => recipe.urgentFoods.length > 0);

  return (
    <div className="space-y-8">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#1F5A41] px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-32 -z-10 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-36 right-28 -z-10 h-64 w-64 rounded-full bg-primary blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
              <Sparkles size={14} className="text-[#F4C76A]" /> INSPIRACIÓN PARA COCINAR
            </span>
            <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">¿Qué se te antoja hoy?</h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Explora el recetario completo. Las ideas que aprovechan tus alimentos aparecen primero.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
            <ChefHat size={20} className="text-[#F4C76A]" />
            <div><p className="text-xl font-semibold">{insights.length}</p><p className="text-xs text-white/65">recetas para explorar</p></div>
          </div>
        </div>
      </section>

      {ingredientFilter && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-950">
            Mostrando recetas para aprovechar tu <strong>{ingredientFilter}</strong> antes de que venza.
          </p>
          <button type="button" onClick={clearIngredientFilter} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-amber-900 hover:bg-amber-100">
            Limpiar filtro <X size={15} />
          </button>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold">El recetario</h2>
            <p className="mt-1 text-sm text-ink-muted">{visibleRecipes.length} {visibleRecipes.length === 1 ? "receta" : "recetas"} disponibles</p>
          </div>
          <div className="w-full sm:max-w-xs">
            <Input
              aria-label="Buscar recetas"
              placeholder="Buscar receta o ingrediente..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            { id: "all" as const, label: "Todas" },
            { id: "ready" as const, label: "Listas para cocinar" },
            { id: "rescue" as const, label: "Rescatar alimentos" },
          ]).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setQuickFilter(filter.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                quickFilter === filter.id
                  ? "border-emerald-800 bg-emerald-800 text-white shadow-sm"
                  : "border-border bg-white text-ink-muted hover:border-primary/40 hover:text-primary"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setSelectedFilter(filter.label)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selectedFilter === filter.label
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border/80 bg-white/80 text-ink-muted hover:border-primary/40"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {urgentRecipes.length > 0 && quickFilter !== "ready" && (
          <section className="space-y-4 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><Flame size={20} /></span>
              <div>
                <h2 className="text-xl font-semibold text-amber-950">🔥 Úsalos antes de que venzan</h2>
                <p className="mt-1 text-sm text-amber-900/75">Recetas priorizadas según los alimentos más próximos a vencer en tu inventario.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {urgentRecipes.slice(0, 3).map((recipe) => (
                <RecipeCatalogCard key={`urgent-${recipe.id}`} recipe={recipe} featured />
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">El recetario</h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted"><Sparkles size={14} className="text-primary" /> Prioridad por vencimiento y compatibilidad</span>
        </div>

        {visibleRecipes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRecipes.map((recipe) => <RecipeCatalogCard key={recipe.id} recipe={recipe} />)}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <span className="mb-3 block text-4xl">🔎</span>
            <h3 className="font-semibold">No encontramos recetas</h3>
            <p className="mt-1 text-sm text-ink-muted">Prueba con otro nombre o cambia el filtro.</p>
          </Card>
        )}
      </section>
    </div>
  );
}

function matchesIngredientFilter(filter: string, foodName: string) {
  return matchesIngredient(filter, foodName);
}
