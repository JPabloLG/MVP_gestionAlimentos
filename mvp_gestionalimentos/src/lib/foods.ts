/**
 * Inventory helpers that do not depend on React or storage.
 * Name comparisons reuse `normalize` from the recipe engine so "the same food"
 * means the same thing everywhere (Tomates = tomate).
 */
import { FoodCategory, FoodItem, NewFood } from "@/types";
import { estimatedShelfLifeDays } from "@/data/shelfLife";
import { demoFoods } from "@/data/demoFoods";
import { dateInDays, sortByPriority } from "./expiry";
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

/**
 * Suggested spoilage date for a food of the given category registered today.
 * An orientative estimate for users who do not know the real date (RF-03).
 */
export function suggestExpiryDate(category: FoodCategory, today: Date = new Date()): string {
  return dateInDays(estimatedShelfLifeDays[category], today);
}

/**
 * Foods the user already has under the same normalized name, most urgent first.
 * Lets the form warn before a re-purchase is registered as a new food.
 */
export function findDuplicates(name: string, foods: FoodItem[], today: Date = new Date()): FoodItem[] {
  const key = normalize(name);
  if (!key) return [];
  return sortByPriority(
    foods.filter((f) => normalize(f.name) === key),
    today
  );
}
