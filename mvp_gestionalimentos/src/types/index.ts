export type FoodCategory =
  | "frutas"
  | "verduras"
  | "lacteos"
  | "carnes"
  | "granos"
  | "panaderia"
  | "bebidas"
  | "congelados"
  | "despensa"
  | "otros";

export type Unit =
  | "unidades"
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "paquetes"
  | "porciones";

export interface FoodItem {
  id: string; // crypto.randomUUID()
  userId: string; // RN-01: cada alimento pertenece a un usuario
  name: string; // 2–60 caracteres
  quantity: number; // > 0
  unit: Unit;
  category: FoodCategory;
  expiresAt: string; // "YYYY-MM-DD" (fecha local, NO ISO con hora)
  notes?: string; // opcional, máx. 120 caracteres
  photoUrl?: string; // data URL (base64), opcional
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ExpiryStatus = "expired" | "critical" | "soon" | "fresh";

export interface RecipeIngredient {
  key: string; // normalizado
  label: string; // legible
  optional?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  timeMinutes: number;
  servings: number;
  difficulty: "facil" | "media";
  emoji: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserStats {
  rescued: number; // alimentos marcados como consumidos antes de vencer
  wasted: number; // marcados como desechados o vencidos
}

export interface Session {
  userId: string;
  token?: string;
}
