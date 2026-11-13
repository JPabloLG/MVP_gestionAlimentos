import { FoodItem, Recipe, ExpiryStatus, RecipeIngredient } from "@/types";
import { getDaysRemaining, getExpiryStatus } from "./expiry";

const SYNONYMS: Record<string, string[]> = {
  papa: ["patata"],
  patata: ["papa"],
  huevo: ["huevos"],
  huevos: ["huevo"],
  cebolla: ["cebolla larga", "cebolleta"],
  "cebolla larga": ["cebolla"],
  platano: ["plátano", "banano", "plátano maduro", "banano maduro"],
  plátano: ["platano", "banano"],
  banano: ["platano", "plátano"],
  tomate: ["tomates"],
  tomates: ["tomate"],
  pollo: ["pechuga de pollo", "muslo de pollo"],
  "pechuga de pollo": ["pollo"],
  "muslo de pollo": ["pollo"],
  leche: ["leche entera", "leche descremada"],
  arroz: ["arroz blanco"],
  pan: ["pan tajado", "pan"],
};

function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalize(text: string): string {
  if (!text) return "";
  let t = removeAccents(text.toLowerCase());
  t = t.replace(/\s+/g, " ").trim();
  // simple singularization for common Spanish plurals
  // For words ending in 'es' like 'tomates' (ends in consonant+e+s in some cases) - better to try removing just 's' first in many cases
  if (t.endsWith("es") && t.length > 4) {
    // Try removing just 's' first: tomates -> tomate (correct). If that doesn't look right, also try removing 'es'
    const withoutS = t.slice(0, -1); // tomatoes without final s
    // prefer withoutS for most cases like tomates, papas
    t = withoutS;
  } else if (t.endsWith("s") && t.length > 3 && !t.endsWith("us") && !t.endsWith("is")) {
    t = t.slice(0, -1);
  }
  return t;
}

function getSynonymKeys(normalized: string): string[] {
  const keys = new Set<string>([normalized]);
  // direct synonyms
  const syns = SYNONYMS[normalized];
  if (syns) {
    for (const s of syns) {
      keys.add(normalize(s));
    }
  }
  // also check if any synonym maps back
  for (const [k, v] of Object.entries(SYNONYMS)) {
    const nk = normalize(k);
    if (nk === normalized) {
      for (const s of v) {
        keys.add(normalize(s));
      }
    }
    for (const s of v) {
      if (normalize(s) === normalized) {
        keys.add(nk);
      }
    }
  }
  return Array.from(keys);
}

function ingredientMatches(ingredientKeyNorm: string, foodNameNorm: string): boolean {
  const phraseMatches = (phrase: string, text: string) =>
    phrase === text ||
    text.startsWith(`${phrase} `) ||
    text.endsWith(` ${phrase}`) ||
    text.includes(` ${phrase} `);
  const ingredients = getSynonymKeys(ingredientKeyNorm);
  const foods = getSynonymKeys(foodNameNorm);
  return ingredients.some((ingredient) =>
    foods.some((food) => phraseMatches(ingredient, food) || phraseMatches(food, ingredient))
  );
}

export function matchesIngredient(ingredient: string, foodName: string): boolean {
  return ingredientMatches(normalize(ingredient), normalize(foodName));
}

export interface RecipeInsight extends Recipe {
  usedFoods: Array<{
    foodId: string;
    foodName: string;
    urgency: ExpiryStatus;
    daysRemaining: number;
  }>;
  missingIngredients: Array<RecipeIngredient & { keyNorm: string }>;
  coverage: number; // 0-1
  score: number;
  section: "rescue" | "withwhatyouhave";
  matchedIngredients: number;
  requiredIngredients: number;
  readyToCook: boolean;
  urgentFoods: Array<{
    foodId: string;
    foodName: string;
    urgency: ExpiryStatus;
    daysRemaining: number;
  }>;
}

export type RecommendedRecipe = RecipeInsight;

export function getRecipeInsights(
  foods: FoodItem[],
  recipes: Recipe[],
  today: Date = new Date()
): RecipeInsight[] {
  const availableFoods = foods
    .map((food) => ({
      food,
      daysRemaining: getDaysRemaining(food.expiresAt, today),
    }))
    .filter(({ daysRemaining }) => daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const results: RecipeInsight[] = [];
  for (const recipe of recipes) {
    const usedFoods: RecipeInsight["usedFoods"] = [];
    const missingIngredients: RecipeInsight["missingIngredients"] = [];
    let matchedIngredients = 0;
    const nonOptionalIngredients = recipe.ingredients.filter((i) => !i.optional);

    for (const ing of recipe.ingredients) {
      const ingKeyNorm = normalize(ing.key || ing.label);
      const match = availableFoods.find(({ food }) =>
        ingredientMatches(ingKeyNorm, normalize(food.name))
      );
      if (!match) {
        missingIngredients.push({ ...ing, keyNorm: ingKeyNorm });
      } else {
        if (!ing.optional) matchedIngredients++;
        if (!usedFoods.some((used) => used.foodId === match.food.id)) {
          usedFoods.push({
            foodId: match.food.id,
            foodName: match.food.name,
            urgency: getExpiryStatus(match.daysRemaining),
            daysRemaining: match.daysRemaining,
          });
        }
      }
    }

    const requiredIngredients = nonOptionalIngredients.length;
    const coverage = requiredIngredients === 0 ? 0 : matchedIngredients / requiredIngredients;
    const urgentFoods = usedFoods
      .filter((food) => food.daysRemaining <= 3)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
    const weightSum = usedFoods.reduce((total, food) => {
      if (food.daysRemaining === 0) return total + 5;
      if (food.daysRemaining <= 3) return total + 3;
      return total + 1;
    }, 0);
    const score = weightSum + coverage * 10;
    results.push({
      ...recipe,
      usedFoods,
      missingIngredients,
      coverage,
      score,
      section: urgentFoods.length > 0 ? "rescue" : "withwhatyouhave",
      matchedIngredients,
      requiredIngredients,
      readyToCook: requiredIngredients > 0 && matchedIngredients === requiredIngredients,
      urgentFoods,
    });
  }

  results.sort((a, b) => {
    if (b.urgentFoods.length !== a.urgentFoods.length) {
      return b.urgentFoods.length - a.urgentFoods.length;
    }
    const aSoonest = a.urgentFoods[0]?.daysRemaining ?? Infinity;
    const bSoonest = b.urgentFoods[0]?.daysRemaining ?? Infinity;
    if (aSoonest !== bSoonest) return aSoonest - bSoonest;
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    if (b.score !== a.score) return b.score - a.score;
    return a.title.localeCompare(b.title, "es");
  });
  return results;
}

export function recommendRecipes(
  foods: FoodItem[],
  recipes: Recipe[],
  today: Date = new Date()
): RecommendedRecipe[] {
  return getRecipeInsights(foods, recipes, today).filter(
    (recipe) => recipe.urgentFoods.length > 0 || recipe.coverage >= 0.6
  );
}
