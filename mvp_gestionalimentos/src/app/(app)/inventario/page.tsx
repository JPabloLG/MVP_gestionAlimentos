"use client";

import React, { useMemo, useState } from "react";
import { useFoods } from "@/hooks/useFoods";
import { FoodCard } from "@/components/inventory/FoodCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";
import { Plus } from "lucide-react";
import { sortByPriority } from "@/lib/expiry";
import { categoriesList, categoryMeta } from "@/data/categories";
import { getExpiryStatus, getDaysRemaining } from "@/lib/expiry";
import { Package, Search, Sparkles } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { groupIdenticalFoods } from "@/lib/inventory";

const PAGE_SIZE = 12;

export default function InventarioPage() {
  const { foods, loadDemoFoods } = useFoods();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const groups = useMemo(() => {
    let filtered = foods.filter((food) =>
      food.name.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es"))
    );
    if (categoryFilter !== "all") {
      filtered = filtered.filter((food) => food.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((food) =>
        getExpiryStatus(getDaysRemaining(food.expiresAt)) === statusFilter
      );
    }
    if (sortBy === "priority") {
      filtered = sortByPriority(filtered);
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es"));
    } else if (sortBy === "recent") {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return groupIdenticalFoods(filtered);
  }, [foods, search, categoryFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageGroups = groups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const updateFilter = (update: () => void) => {
    update();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#E3F2EA] px-6 py-7 sm:px-9 sm:py-9">
        <div className="pointer-events-none absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full border border-primary/10" />
        <div className="pointer-events-none absolute -bottom-32 right-20 -z-10 h-64 w-64 rounded-full bg-white/70 blur-3xl" />
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"><Package size={14} /> TU COCINA, EN ORDEN</span>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tu inventario</h1>
            <p className="mt-2 text-sm text-ink-muted">
              {foods.length ? `${foods.length} registros · agrupados por producto · lo urgente primero` : "Ten a la vista lo que tienes y úsalo antes de que se pierda."}
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={18} />
          Agregar alimento
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-border/70 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            aria-label="Buscar alimentos"
            placeholder="Buscar en tu inventario..."
            value={search}
            onChange={(e) => updateFilter(() => setSearch(e.target.value))}
            className="pl-11"
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Categorías</p>
          <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter(() => setCategoryFilter("all"))}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              categoryFilter === "all" ? "bg-primary text-white border-primary" : "border-border bg-white text-ink-muted hover:border-primary/40"
            }`}
          >
            Todas
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter(() => setCategoryFilter(cat))}
              className={`rounded-full border px-3 py-2 text-sm transition ${
                categoryFilter === cat ? "bg-primary text-white border-primary" : "border-border bg-white text-ink-muted hover:border-primary/40"
              }`}
            >
              {categoryMeta[cat].emoji} {categoryMeta[cat].label}
            </button>
          ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Estado</p>
          <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter(() => setStatusFilter("all"))}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              statusFilter === "all" ? "bg-primary text-white border-primary" : "border-border bg-white text-ink-muted hover:border-primary/40"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => updateFilter(() => setStatusFilter("expired"))}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              statusFilter === "expired" ? "bg-expired text-white border-expired" : "border-border bg-white text-ink-muted hover:border-expired/50"
            }`}
          >
            Vencidos
          </button>
          <button
            onClick={() => updateFilter(() => setStatusFilter("critical"))}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              statusFilter === "critical" ? "bg-critical text-white border-critical" : "border-border bg-white text-ink-muted hover:border-critical/50"
            }`}
          >
            Úsalo ya
          </button>
          <button
            onClick={() => updateFilter(() => setStatusFilter("soon"))}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              statusFilter === "soon" ? "bg-soon text-white border-soon" : "border-border bg-white text-ink-muted hover:border-soon/50"
            }`}
          >
            Pronto
          </button>
          <button
            onClick={() => updateFilter(() => setStatusFilter("fresh"))}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              statusFilter === "fresh" ? "bg-fresh text-white border-fresh" : "border-border bg-white text-ink-muted hover:border-fresh/50"
            }`}
          >
            Fresco
          </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
          <p className="text-sm text-ink-muted">
            {groups.length} {groups.length === 1 ? "grupo" : "grupos"} · {foods.length} registros
          </p>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            Ordenar
            <select
          value={sortBy}
          onChange={(e) => updateFilter(() => setSortBy(e.target.value))}
          className="min-h-10 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <option value="priority">Más urgentes</option>
          <option value="name">Nombre</option>
          <option value="recent">Recientes</option>
        </select>
          </label>
        </div>
      </section>

      {foods.length === 0 ? (
        <EmptyState
          emoji="🛒"
          title="La nevera está esperando"
          description="Agrega tus alimentos para recibir alertas de vencimiento y recetas hechas para lo que ya tienes."
          actionLabel="Agregar alimento"
          onAction={() => setIsFormOpen(true)}
        >
          <div className="mt-5">
            <Button variant="secondary" onClick={loadDemoFoods}>
              <Sparkles size={16} /> Cargar inventario de prueba
            </Button>
          </div>
        </EmptyState>
      ) : groups.length === 0 ? (
        <EmptyState
          emoji="🔎"
          title="No encontramos alimentos"
          description="Prueba con otro nombre o cambia los filtros para ver más resultados."
        />
      ) : (
        <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pageGroups.map((group) => (
            <FoodCard key={group.key} foods={group.foods} />
          ))}
        </div>
        {totalPages > 1 && (
          <nav aria-label="Paginación del inventario" className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-border bg-white px-3 text-sm font-medium text-ink transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="px-3 text-sm text-ink-muted" aria-live="polite">
              Página <strong className="text-ink">{safePage}</strong> de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage === totalPages}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-border bg-white px-3 text-sm font-medium text-ink transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </nav>
        )}
        </>
      )}

      <FoodFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
