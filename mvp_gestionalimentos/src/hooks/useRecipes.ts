"use client";

import { useMemo } from "react";
import { recipes } from "@/data/recipes";
import { useFoods } from "./useFoods";
import { getRecipeInsights, recommendRecipes } from "@/lib/recipes";

export function useRecipes() {
  const { foods } = useFoods();
  const recommendations = useMemo(() => {
    return recommendRecipes(foods, recipes);
  }, [foods]);
  const insights = useMemo(() => getRecipeInsights(foods, recipes), [foods]);
  return { recipes, recommendations, insights };
}
