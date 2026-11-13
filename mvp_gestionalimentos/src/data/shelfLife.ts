/**
 * ORIENTATIVE shelf life per category, in days from the day the food is
 * registered. Used only to suggest a date when the user does not know it
 * (RF-03: "fecha de vencimiento o deterioro estimado").
 *
 * TEAM: these values are rough, conservative guesses for a home fridge or
 * pantry and have NOT been validated against a food safety source. Review
 * them before the pilot. The user can always change the suggested date, and
 * the app never guarantees that a food is safe to eat.
 */
import { FoodCategory } from "@/types";

export const estimatedShelfLifeDays: Record<FoodCategory, number> = {
  frutas: 5,
  verduras: 5,
  lacteos: 7,
  carnes: 2,
  granos: 180,
  panaderia: 3,
  bebidas: 30,
  congelados: 90,
  despensa: 180,
  otros: 7,
};
