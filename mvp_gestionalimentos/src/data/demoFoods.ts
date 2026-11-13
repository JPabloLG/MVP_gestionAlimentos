/**
 * Sample inventory for "Cargar alimentos de ejemplo" and for the demo account.
 * Dates are offsets from today so the sample always shows the four traffic
 * light states (expired, critical, soon, fresh) no matter when it is loaded.
 */
import { NewFood } from "@/types";
import { demoPhotos } from "./demoPhotos";

export const demoFoods: Array<Omit<NewFood, "expiresAt"> & { daysFromToday: number }> = [
  { name: "Leche", quantity: 1, unit: "l", category: "lacteos", daysFromToday: 7, photoUrl: demoPhotos.leche },
  { name: "Huevos", quantity: 12, unit: "unidades", category: "despensa", daysFromToday: 14 },
  { name: "Tomate", quantity: 6, unit: "unidades", category: "verduras", daysFromToday: 1 },
  { name: "Pollo", quantity: 500, unit: "g", category: "carnes", daysFromToday: 0 },
  { name: "Banano maduro", quantity: 6, unit: "unidades", category: "frutas", daysFromToday: -1 },
  { name: "Arroz", quantity: 1, unit: "kg", category: "granos", daysFromToday: 60 },
  { name: "Queso", quantity: 250, unit: "g", category: "lacteos", daysFromToday: 4 },
  { name: "Cebolla", quantity: 1, unit: "kg", category: "verduras", daysFromToday: 10 },
  { name: "Aguacate", quantity: 2, unit: "unidades", category: "frutas", daysFromToday: 2, photoUrl: demoPhotos.aguacate },
  { name: "Yogurt", quantity: 4, unit: "unidades", category: "lacteos", daysFromToday: 3 },
  { name: "Pan", quantity: 1, unit: "paquetes", category: "panaderia", daysFromToday: 5 },
  { name: "Manzanas", quantity: 5, unit: "unidades", category: "frutas", daysFromToday: 6, photoUrl: demoPhotos.manzanas },
  { name: "Zanahoria", quantity: 1, unit: "kg", category: "verduras", daysFromToday: -2, notes: "Revisar antes de usar" },
];
