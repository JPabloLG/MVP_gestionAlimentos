"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ExpiryBadge } from "./ExpiryBadge";
import { Button } from "@/components/ui/Button";
import { categoryMeta } from "@/data/categories";
import { FoodItem } from "@/types";
import { Edit, Trash2, Check, X } from "lucide-react";
import { useFoods } from "@/hooks/useFoods";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FoodFormModal } from "./FoodFormModal";
import { motion } from "framer-motion";

export function FoodCard({ food }: { food: FoodItem }) {
  const { markConsumed, markWasted, deleteFood } = useFoods();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <motion.div layout>
        <Card>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{categoryMeta[food.category].emoji}</span>
              <div>
                <h3 className="font-semibold">{food.name}</h3>
                <p className="text-sm text-ink-muted">
                  {food.quantity} {food.unit}
                </p>
              </div>
            </div>
            <ExpiryBadge expiresAt={food.expiresAt} />
          </div>
          {food.notes && <p className="text-sm text-ink-muted mb-3">{food.notes}</p>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => markConsumed(food.id)} aria-label="Marcar como consumido">
              <Check size={16} />
              Consumido
            </Button>
            <Button size="sm" variant="secondary" onClick={() => markWasted(food.id)} aria-label="Marcar como desechado">
              <X size={16} />
              Desechado
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowEdit(true)} aria-label="Editar">
              <Edit size={16} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDelete(true)} aria-label="Eliminar">
              <Trash2 size={16} />
            </Button>
          </div>
        </Card>
      </motion.div>
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteFood(food.id)}
        title="Eliminar alimento"
        description="¿Estás seguro de que deseas eliminar este alimento?"
        confirmLabel="Eliminar"
        variant="danger"
      />
      <FoodFormModal isOpen={showEdit} onClose={() => setShowEdit(false)} editFood={food} />
    </>
  );
}
