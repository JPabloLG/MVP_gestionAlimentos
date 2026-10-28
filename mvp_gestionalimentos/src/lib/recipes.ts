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
  if (ingredientKeyNorm === foodNameNorm) return true;
  // inclusion match (e.g. "pechuga de pollo" contains "pollo" conceptually) - but better check both directions
  if (foodNameNorm.includes(ingredientKeyNorm) && ingredientKeyNorm.length >= 3) return true;
  if (ingredientKeyNorm.includes(foodNameNorm) && foodNameNorm.length >= 3) return true;
  // check synonyms
  const ingSyns = getSynonymKeys(ingredientKeyNorm);
  const foodSyns = getSynonymKeys(foodNameNorm);
  for (const is of ingSyns) {
    if (is === foodNameNorm) return true;
    if (foodNameNorm.includes(is) && is.length >= 3) return true;
  }
  for (const fs of foodSyns) {
    if (fs === ingredientKeyNorm) return true;
    if (ingredientKeyNorm.includes(fs) && fs.length >= 3) return true;
  }
  return false;
}

export interface RecommendedRecipe extends Recipe {
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
}

export function recommendRecipes(
  foods: FoodItem[],
  recipes: Recipe[],
  today: Date = new Date()
): RecommendedRecipe[] {
  const results: RecommendedRecipe[] = [];

  for (const recipe of recipes) {
    const usedFoods: RecommendedRecipe["usedFoods"] = [];
    const missingIngredients: RecommendedRecipe["missingIngredients"] = [];
    let matchCountNonOptional = 0;
    const nonOptionalIngredients = recipe.ingredients.filter((i) => !i.optional);

    for (const ing of recipe.ingredients) {
      const ingKeyNorm = normalize(ing.key || ing.label);
      let found = false;
      // look for matching food (ignore expired for "main" matching as per spec? spec says "Ignorar alimentos vencidos para el matching principal (pero marcarlos en una alerta aparte)")
      for (const food of foods) {
        const days = getDaysRemaining(food.expiresAt, today);
        const status = getExpiryStatus(days);
        if (status === "expired") {
          // ignore for matching principal
          continue;
        }
        const foodNameNorm = normalize(food.name);
        if (ingredientMatches(ingKeyNorm, foodNameNorm)) {
          found = true;
          if (!usedFoods.find((uf) => uf.foodId === food.id)) {
            usedFoods.push({
              foodId: food.id,
              foodName: food.name,
              urgency: status,
              daysRemaining: days,
            });
          }
          break;
        }
      }
      if (!found) {
        missingIngredients.push({ ...ing, keyNorm: ingKeyNorm });
      } else {
        if (!ing.optional) {
          matchCountNonOptional++;
        }
      }
    }

    if (nonOptionalIngredients.length === 0) {
      continue;
    }

    const coverage = matchCountNonOptional / nonOptionalIngredients.length;

    // calculate score: peso por alimento usado critical=5, soon=3, fresh=1 + bonus por cobertura
    let weightSum = 0;
    for (const uf of usedFoods) {
      if (uf.urgency === "critical") weightSum += 5;
      else if (uf.urgency === "soon") weightSum += 3;
      else if (uf.urgency === "fresh") weightSum += 1;
      // expired ignored
    }
    const score = weightSum + coverage * 10;

    const hasCriticalOrSoon = usedFoods.some((uf) => uf.urgency === "critical" || uf.urgency === "soon");
    if (hasCriticalOrSoon) {
      // Para rescatar hoy
      results.push({
        ...recipe,
        usedFoods,
        missingIngredients,
        coverage,
        score,
        section: "rescue",
      });
    } else if (coverage >= 0.6) {
      // Con lo que tienes
      results.push({
        ...recipe,
        usedFoods,
        missingIngredients,
        coverage,
        score,
        section: "withwhatyouhave",
      });
    }
  }

  // sort by score desc
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return 0;
  });

  return results;
}
