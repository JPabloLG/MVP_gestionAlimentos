import { FoodCategory } from "@/types";

export const categoryMeta: Record<
  FoodCategory,
  { label: string; emoji: string; color: string }
> = {
  frutas: { label: "Frutas", emoji: "🍎", color: "#EF6B4A" },
  verduras: { label: "Verduras", emoji: "🥬", color: "#3FA878" },
  lacteos: { label: "Lácteos", emoji: "🥛", color: "#7C9FBF" },
  carnes: { label: "Carnes", emoji: "🍗", color: "#B5372B" },
  granos: { label: "Granos", emoji: "🌾", color: "#F2B134" },
  panaderia: { label: "Panadería", emoji: "🥖", color: "#D9A95B" },
  bebidas: { label: "Bebidas", emoji: "🥤", color: "#6B9BD2" },
  congelados: { label: "Congelados", emoji: "❄️", color: "#7FCBFF" },
  despensa: { label: "Despensa", emoji: "🧂", color: "#A89F91" },
  otros: { label: "Otros", emoji: "🍽️", color: "#6B7770" },
};

export const categoriesList: FoodCategory[] = [
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
];
