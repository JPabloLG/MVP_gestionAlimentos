"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ExpiryBadge } from "./ExpiryBadge";
import { categoryMeta } from "@/data/categories";
import { FoodItem } from "@/types";
import { Check, ChevronDown, ChevronUp, Pencil, Trash2, X } from "lucide-react";
import { useFoods } from "@/hooks/useFoods";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FoodFormModal } from "./FoodFormModal";
import { motion } from "framer-motion";
import { getDaysRemaining, getExpiryStatus } from "@/lib/expiry";
import { FoodImage } from "./FoodImage";
import Link from "next/link";
import { CookingPot } from "lucide-react";

interface FoodCardProps {
  foods: FoodItem[];
}

function ActionIcon({
  label,
  onClick,
  children,
  destructive = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white transition hover:border-primary/30 hover:bg-primary-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        destructive ? "text-ink-muted hover:border-expired/30 hover:bg-expired-soft hover:text-expired" : "text-ink-muted hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

export function FoodCard({ foods }: FoodCardProps) {
  const { markConsumed, markWasted, deleteFood } = useFoods();
  const [isExpanded, setIsExpanded] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<FoodItem | null>(null);
  const [foodToEdit, setFoodToEdit] = useState<FoodItem | null>(null);
  const primaryFood = foods[0];
  const lotCount = foods.length;
  const status = getExpiryStatus(getDaysRemaining(primaryFood.expiresAt));
  const daysRemaining = getDaysRemaining(primaryFood.expiresAt);
  const borderColor = {
    expired: "border-l-[#8F2D28]",
    critical: "border-l-[#E88732]",
    soon: "border-l-[#D8B53B]",
    fresh: "border-l-[#76A982]",
  }[status];
  const displayName = primaryFood.name.trim()
    ? primaryFood.name.trim().charAt(0).toLocaleUpperCase("es") + primaryFood.name.trim().slice(1)
    : primaryFood.name;
  const unitLabel = (food: FoodItem) => {
    if (food.quantity !== 1) return food.unit;
    const singularUnits: Partial<Record<FoodItem["unit"], string>> = {
      unidades: "unidad",
      paquetes: "paquete",
      porciones: "porción",
    };
    return singularUnits[food.unit] ?? food.unit;
  };

  const actOnOne = (action: (id: string) => Promise<void>) => {
    const nextFood = [...foods].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];
    if (nextFood) void action(nextFood.id);
  };

  return (
    <>
      <motion.div layout whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
        <Card className={`group h-full border border-l-4 border-border ${borderColor} bg-white p-4 shadow-sm transition-shadow hover:shadow-lg hover:shadow-ink/5`}>
          <div className="-mx-4 -mt-4 mb-4 overflow-hidden rounded-t-[calc(1.5rem-1px)]">
            <FoodImage food={primaryFood} />
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg">
              {categoryMeta[primaryFood.category].emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-ink">{displayName}</h3>
                <ExpiryBadge expiresAt={primaryFood.expiresAt} />
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {primaryFood.quantity} {unitLabel(primaryFood)}
                {lotCount > 1 && <span className="text-ink-muted/70"> · cada lote</span>}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                  {categoryMeta[primaryFood.category].label}
                </span>
                {lotCount > 1 && (
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                    ×{lotCount} lotes
                  </span>
                )}
              </div>
              {daysRemaining >= 0 && daysRemaining <= 3 && (
                <Link
                  href={`/recetas?ingrediente=${encodeURIComponent(primaryFood.name)}`}
                  className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                >
                  <CookingPot size={14} /> Recetas con este alimento
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
            <div className="flex items-center gap-1.5">
              <ActionIcon
                label={`Marcar un lote de ${displayName} como consumido`}
                onClick={() => actOnOne(markConsumed)}
              >
                <Check size={16} />
              </ActionIcon>
              <ActionIcon
                label={`Marcar un lote de ${displayName} como desechado`}
                onClick={() => actOnOne(markWasted)}
                destructive
              >
                <X size={16} />
              </ActionIcon>
              {lotCount === 1 && (
                <>
                  <ActionIcon label={`Editar ${displayName}`} onClick={() => setFoodToEdit(primaryFood)}>
                    <Pencil size={15} />
                  </ActionIcon>
                  <ActionIcon label={`Eliminar ${displayName}`} onClick={() => setFoodToDelete(primaryFood)} destructive>
                    <Trash2 size={15} />
                  </ActionIcon>
                </>
              )}
            </div>
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary transition hover:bg-primary-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {isExpanded ? "Cerrar" : lotCount > 1 ? "Ver lotes" : "Detalles"}
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
              {foods.map((food, index) => (
                <div key={food.id} className="rounded-xl bg-background/80 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink">
                        Lote {index + 1} <span className="font-normal text-ink-muted">· {food.quantity} {unitLabel(food)}</span>
                      </p>
                      {food.notes && <p className="mt-1 truncate text-[11px] text-ink-muted">{food.notes}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <ActionIcon label="Marcar lote como consumido" onClick={() => void markConsumed(food.id)}>
                        <Check size={15} />
                      </ActionIcon>
                      <ActionIcon label="Marcar lote como desechado" onClick={() => void markWasted(food.id)} destructive>
                        <X size={15} />
                      </ActionIcon>
                      <ActionIcon label="Editar lote" onClick={() => setFoodToEdit(food)}>
                        <Pencil size={14} />
                      </ActionIcon>
                      <ActionIcon label="Eliminar lote" onClick={() => setFoodToDelete(food)} destructive>
                        <Trash2 size={14} />
                      </ActionIcon>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <ConfirmDialog
        isOpen={Boolean(foodToDelete)}
        onClose={() => setFoodToDelete(null)}
        onConfirm={() => {
          if (foodToDelete) void deleteFood(foodToDelete.id);
        }}
        title="Eliminar alimento"
        description={`¿Quieres eliminar ${foodToDelete?.name ?? "este alimento"} del inventario?`}
        confirmLabel="Eliminar"
        variant="danger"
      />
      <FoodFormModal
        isOpen={Boolean(foodToEdit)}
        onClose={() => setFoodToEdit(null)}
        editFood={foodToEdit ?? undefined}
      />
    </>
  );
}
