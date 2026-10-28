"use client";

import { useMemo } from "react";
import { recipes } from "@/data/recipes";
import { useFoods } from "./useFoods";
import { recommendRecipes } from "@/lib/recipes";

export function useRecipes() {
  const { foods } = useFoods();
  const recommendations = useMemo(() => {
    return recommendRecipes(foods, recipes);
  }, [foods]);
  return { recipes, recommendations };
}
