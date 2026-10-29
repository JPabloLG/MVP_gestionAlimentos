import { z } from "zod";

export const foodCategories = [
  "frutas",
  "verduras",
  "lacteos",
  "carnes",
  "granos",
  "panaderia",
  "bebidas",
  "congelados",
  "despensa",
  "otros",
] as const;

export const units = ["unidades", "g", "kg", "ml", "l", "paquetes", "porciones"] as const;

export const foodSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre debe tener máximo 60 caracteres"),
  quantity: z
    .number({ invalid_type_error: "La cantidad debe ser un número" })
    .positive("La cantidad debe ser mayor a 0"),
  unit: z.enum(units, { required_error: "Selecciona una unidad" }),
  category: z.enum(foodCategories, { required_error: "Selecciona una categoría" }),
  expiresAt: z.string().min(1, "Selecciona una fecha de vencimiento"),
  notes: z.string().max(120, "Máximo 120 caracteres").optional().or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
});

export type FoodFormData = z.infer<typeof foodSchema>;
