"use client";

import React, { useState } from "react";
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

export default function InventarioPage() {
  const { foods, loadDemoFoods } = useFoods();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");
  const [isFormOpen, setIsFormOpen] = useState(false);

  let filtered = foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  if (categoryFilter !== "all") {
    filtered = filtered.filter((f) => f.category === categoryFilter);
  }
  if (statusFilter !== "all") {
    filtered = filtered.filter((f) => {
      const status = getExpiryStatus(getDaysRemaining(f.expiresAt));
      return status === statusFilter;
    });
  }
  if (sortBy === "priority") {
    filtered = sortByPriority(filtered);
  } else if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "recent") {
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-display">Inventario</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={18} />
          Agregar alimento
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              categoryFilter === "all" ? "bg-primary text-white border-primary" : "border-border"
            }`}
          >
            Todas
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                categoryFilter === cat ? "bg-primary text-white border-primary" : "border-border"
              }`}
            >
              {categoryMeta[cat].emoji} {categoryMeta[cat].label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              statusFilter === "all" ? "bg-primary text-white border-primary" : "border-border"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("expired")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              statusFilter === "expired" ? "bg-expired text-white border-expired" : "border-border"
            }`}
          >
            Vencidos
          </button>
          <button
            onClick={() => setStatusFilter("critical")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              statusFilter === "critical" ? "bg-critical text-white border-critical" : "border-border"
            }`}
          >
            Úsalo ya
          </button>
          <button
            onClick={() => setStatusFilter("soon")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              statusFilter === "soon" ? "bg-soon text-white border-soon" : "border-border"
            }`}
          >
            Pronto
          </button>
          <button
            onClick={() => setStatusFilter("fresh")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              statusFilter === "fresh" ? "bg-fresh text-white border-fresh" : "border-border"
            }`}
          >
            Fresco
          </button>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-border px-3 py-2 text-sm"
        >
          <option value="priority">Más urgentes</option>
          <option value="name">Nombre</option>
          <option value="recent">Recientes</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🛒"
          title="Tu inventario está vacío"
          description="Agrega tu primer alimento para empezar a gestionar lo que tienes"
          actionLabel="Agregar alimento"
          onAction={() => setIsFormOpen(true)}
        >
          <div className="mt-4">
            <Button variant="secondary" onClick={loadDemoFoods}>
              Cargar alimentos de ejemplo
            </Button>
          </div>
        </EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}

      <FoodFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
