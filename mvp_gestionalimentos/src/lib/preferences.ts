/**
 * Small per-user conveniences kept in `gestionalo:prefs:<userId>`.
 *
 * Remembering the last unit and category makes entering a whole grocery run
 * faster (most items share them). It is a convenience only: reads fall back
 * to defaults and failed writes are ignored, never blocking a save.
 */
import { z } from "zod";
import { FoodCategory, Unit } from "@/types";
import { foodCategories, units } from "@/lib/validation/food";
import { readJson, writeJson } from "@/lib/storage/safeStorage";

export interface FormPrefs {
  unit: Unit;
  category: FoodCategory;
}

export const DEFAULT_FORM_PREFS: FormPrefs = { unit: "unidades", category: "otros" };

const prefsSchema = z.object({ unit: z.enum(units), category: z.enum(foodCategories) });

const key = (userId: string) => `gestionalo:prefs:${userId}`;

/** Last unit and category the user saved, or the defaults. */
export function getFormPrefs(userId: string | undefined): FormPrefs {
  return userId ? readJson(key(userId), prefsSchema, DEFAULT_FORM_PREFS) : DEFAULT_FORM_PREFS;
}

/** Remembers the unit and category for the next food. */
export function saveFormPrefs(userId: string | undefined, prefs: FormPrefs): void {
  if (!userId) return;
  try {
    writeJson(key(userId), { unit: prefs.unit, category: prefs.category });
  } catch {
    // A convenience must never fail the save that triggered it.
  }
}
