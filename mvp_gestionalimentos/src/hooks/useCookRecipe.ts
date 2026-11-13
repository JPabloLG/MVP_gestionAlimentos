"use client";

import { useState } from "react";
import { useFoods } from "@/hooks/useFoods";
import { useToast } from "@/context/ToastProvider";
import { getRecipeInsights } from "@/lib/recipes";
import type { Recipe } from "@/types";

/** Descuenta del inventario los alimentos que usa la receta. Compartido por el detalle y el modo cocina. */
export function useCookRecipe(recipe: Recipe | undefined) {
  const { foods, consumeFoods } = useFoods();
  const { showToast } = useToast();
  const [isCooking, setIsCooking] = useState(false);
  const [done, setDone] = useState(false);
  const insight = recipe ? getRecipeInsights(foods, [recipe])[0] : undefined;

  const markCooked = async () => {
    if (!insight || insight.usedFoods.length === 0) return;
    setIsCooking(true);
    try {
      const consumedNames = await consumeFoods(insight.usedFoods.map((food) => food.foodId));
      if (consumedNames.length === 0) {
        showToast("No hay ingredientes vigentes en el inventario para descontar.", "info");
        return;
      }
      const listedNames = [...new Set(consumedNames)].join(", ");
      const savedUrgentFood = insight.usedFoods.some((food) => food.daysRemaining <= 3);
      showToast(
        `¡Genial! Receta cocinada. Actualizaste ${listedNames} de tu inventario${savedUrgentFood ? " y aprovechaste alimentos próximos a vencer" : ""}.`,
        "success"
      );
      setDone(true);
    } catch (error) {
      showToast(
        error instanceof Error ? `No se pudo actualizar el inventario: ${error.message}` : "No se pudo actualizar el inventario.",
        "error"
      );
    } finally {
      setIsCooking(false);
    }
  };

  return { foods, insight, isCooking, done, markCooked };
}
