import { FoodItem } from "@/types";

export interface FoodGroup {
  key: string;
  foods: FoodItem[];
}

export function groupIdenticalFoods(foods: FoodItem[]): FoodGroup[] {
  const groups = new Map<string, FoodGroup>();

  for (const food of foods) {
    const key = JSON.stringify([
      food.name,
      food.category,
      food.unit,
      food.quantity,
      food.expiresAt,
    ]);
    const group = groups.get(key);
    if (group) group.foods.push(food);
    else groups.set(key, { key, foods: [food] });
  }

  return Array.from(groups.values());
}
