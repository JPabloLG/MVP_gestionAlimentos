/**
 * Inventory helpers that do not depend on React or storage.
 * Name comparisons reuse `normalize` from the recipe engine so "the same food"
 * means the same thing everywhere (Tomates = tomate).
 */
import { FoodItem, NewFood } from "@/types";
import { demoFoods } from "@/data/demoFoods";
import { dateInDays } from "./expiry";
import { normalize } from "./recipes";

/** The sample inventory with dates resolved against `today`. */
export function buildDemoFoods(today: Date = new Date()): NewFood[] {
  return demoFoods.map(({ daysFromToday, ...food }) => ({
    ...food,
    expiresAt: dateInDays(daysFromToday, today),
  }));
}

/**
 * Sample foods the user does not have yet (by normalized name), so loading the
 * sample twice, or on top of a real inventory, never duplicates anything.
 */
export function missingDemoFoods(existing: FoodItem[], today: Date = new Date()): NewFood[] {
  const names = new Set(existing.map((f) => normalize(f.name)));
  return buildDemoFoods(today).filter((f) => !names.has(normalize(f.name)));
}
