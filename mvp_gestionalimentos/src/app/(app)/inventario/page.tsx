"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useFoods } from "@/hooks/useFoods";
import { FoodCard } from "@/components/inventory/FoodCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";
import { statusMeta, statusOrder } from "@/components/inventory/statusMeta";
import { Plus, Search } from "lucide-react";
import { getDaysRemaining, getExpiryStatus, sortByPriority } from "@/lib/expiry";
import { foldText } from "@/lib/format";
import { categoriesList, categoryMeta } from "@/data/categories";
import { ExpiryStatus, FoodCategory } from "@/types";

const chip = "shrink-0 inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-full text-sm border transition";
const chipOff = "border-border bg-surface hover:bg-surface-muted";

/** Full inventory (RF-04) with search, filters and sorting; most urgent first by default (RF-08). */
export default function InventarioPage() {
  const { foods, loadDemoFoods } = useFoods();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ExpiryStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"priority" | "name" | "recent">("priority");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = foldText(search);
    let list = foods.filter((f) => foldText(f.name).includes(query));
    if (categoryFilter !== "all") list = list.filter((f) => f.category === categoryFilter);
    if (statusFilter !== "all") list = list.filter((f) => getExpiryStatus(getDaysRemaining(f.expiresAt)) === statusFilter);
    if (sortBy === "priority") return sortByPriority(list);
    if (sortBy === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [foods, search, categoryFilter, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display">Inventario</h1>
          <p className="text-sm text-ink-muted">
            {foods.length} {foods.length === 1 ? "alimento registrado" : "alimentos registrados"}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="hidden sm:inline-flex">
          <Plus size={18} aria-hidden="true" />
          Agregar alimento
        </Button>
      </div>

      {foods.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Buscar por nombre</span>
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full rounded-xl border border-border bg-background pl-10 pr-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-muted shrink-0">Ordenar por</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="flex-1 sm:flex-none rounded-xl border border-border bg-background px-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <option value="priority">Más urgentes</option>
                <option value="name">Nombre</option>
                <option value="recent">Recientes</option>
              </select>
            </label>
          </div>

          {/* Status chips: same icon + color as the badges (Gestalt: similarity) */}
          <div role="group" aria-label="Filtrar por estado" className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              aria-pressed={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              className={`${chip} ${statusFilter === "all" ? "bg-ink text-white border-ink" : chipOff}`}
            >
              Todos
            </button>
            {statusOrder.map((s) => {
              const meta = statusMeta[s];
              const Icon = meta.icon;
              const on = statusFilter === s;
              return (
                <button
                  key={s}
                  aria-pressed={on}
                  onClick={() => setStatusFilter(on ? "all" : s)}
                  className={`${chip} ${on ? `${meta.soft} ${meta.text} border-current font-semibold` : chipOff}`}
                >
                  <Icon size={15} aria-hidden="true" className={on ? "" : meta.text} />
                  {meta.label}
                </button>
              );
            })}
          </div>

          <div role="group" aria-label="Filtrar por categoría" className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              aria-pressed={categoryFilter === "all"}
              onClick={() => setCategoryFilter("all")}
              className={`${chip} ${categoryFilter === "all" ? "bg-primary text-white border-primary" : chipOff}`}
            >
              Todas
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                aria-pressed={categoryFilter === cat}
                onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
                className={`${chip} ${categoryFilter === cat ? "bg-primary text-white border-primary" : chipOff}`}
              >
                <span aria-hidden="true">{categoryMeta[cat].emoji}</span> {categoryMeta[cat].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {foods.length === 0 ? (
        <div className="text-center bg-surface rounded-3xl border border-border p-6 sm:p-10">
          <Image src="/illustrations/fridge.svg" alt="" width={320} height={300} priority className="mx-auto w-48 sm:w-60 h-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tu inventario está vacío</h2>
          <p className="text-ink-muted mb-6 max-w-md mx-auto">
            Agrega lo que tienes en la nevera o la despensa y te avisaremos qué usar primero.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus size={18} aria-hidden="true" />
              Agregar alimento
            </Button>
            <Button variant="secondary" onClick={loadDemoFoods}>
              Cargar alimentos de ejemplo
            </Button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Sin resultados"
          description="Ningún alimento coincide con la búsqueda o los filtros."
          actionLabel="Limpiar filtros"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 min-[560px]:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}

      <FoodFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
