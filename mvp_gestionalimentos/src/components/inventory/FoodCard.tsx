"use client";

import React, { useState } from "react";
import { ExpiryBadge } from "./ExpiryBadge";
import { Button } from "@/components/ui/Button";
import { categoryMeta } from "@/data/categories";
import { FoodItem } from "@/types";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useFoods } from "@/hooks/useFoods";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FoodFormModal } from "./FoodFormModal";
import { motion } from "framer-motion";
import { getDaysRemaining, getExpiryStatus } from "@/lib/expiry";
import { statusMeta } from "./statusMeta";

/** One food: identity on top, status on the right, actions grouped at the bottom (Gestalt: proximity). */
export function FoodCard({ food }: { food: FoodItem }) {
  const { markConsumed, markWasted, deleteFood } = useFoods();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const status = getExpiryStatus(getDaysRemaining(food.expiresAt));
  const meta = statusMeta[status];

  return (
    <>
      <motion.article
        layout
        className={`h-full flex flex-col bg-surface rounded-2xl border border-border border-l-4 ${meta.border} shadow-sm p-4`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-2xl ${meta.soft}`} aria-hidden="true">
              {categoryMeta[food.category].emoji}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold leading-tight truncate">{food.name}</h3>
              <p className="text-sm text-ink-muted">
                {food.quantity} {food.unit} · {categoryMeta[food.category].label}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <ExpiryBadge expiresAt={food.expiresAt} />
            {food.expiryIsEstimated && (
              <span className="text-xs text-ink-muted" title="Fecha sugerida según la categoría, no leída de una etiqueta">
                ≈ estimada
              </span>
            )}
          </div>
        </div>
        {food.notes && <p className="text-sm text-ink-muted mb-3 break-words">{food.notes}</p>}
        <div className="mt-auto pt-3 border-t border-border flex items-center gap-2">
          <Button size="sm" variant="secondary" className="flex-1 px-2!" onClick={() => markConsumed(food.id)}>
            <Check size={16} aria-hidden="true" className="text-fresh-ink" />
            Consumido
          </Button>
          <Button size="sm" variant="secondary" className="flex-1 px-2!" onClick={() => markWasted(food.id)}>
            <X size={16} aria-hidden="true" className="text-expired" />
            Desechado
          </Button>
          <Button size="sm" variant="ghost" className="px-0! w-11 shrink-0" onClick={() => setShowEdit(true)} aria-label={`Editar ${food.name}`}>
            <Pencil size={16} aria-hidden="true" />
          </Button>
          <Button size="sm" variant="ghost" className="px-0! w-11 shrink-0" onClick={() => setShowDelete(true)} aria-label={`Eliminar ${food.name}`}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      </motion.article>
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteFood(food.id)}
        title="Eliminar alimento"
        description={`¿Seguro que quieres eliminar "${food.name}"? No contará como consumido ni desechado.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
      <FoodFormModal isOpen={showEdit} onClose={() => setShowEdit(false)} editFood={food} />
    </>
  );
}
