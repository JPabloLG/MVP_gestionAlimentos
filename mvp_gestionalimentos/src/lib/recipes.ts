/**
 * Recipe recommendation engine (RF-09, RF-10, RN-06).
 *
 * Matching is done by whole words, never by substring: "pan" must not match
 * "panela" nor "agua" match "aguacate". A food satisfies an ingredient when
 * the food name contains every word of the ingredient (or of one of its
 * synonyms), so "Pechuga de pollo" satisfies "pollo" but "Maíz" does not
 * satisfy "harina de maíz".
 *
 * Known limit: word matching cannot tell "Salsa de tomate" from "Tomate".
 * That would need a curated ingredient catalog, which is out of scope.
 */
import { FoodItem, Recipe, ExpiryStatus, RecipeIngredient } from "@/types";
import { getDaysRemaining, getExpiryStatus } from "./expiry";
import { foldText } from "./format";

/** Groups of interchangeable ingredient names. Every member is a synonym of the others. */
const SYNONYM_GROUPS: string[][] = [
  ["papa", "patata"],
  ["platano", "banano", "platano maduro", "banano maduro"],
  ["cebolla", "cebolleta"],
  ["yogurt", "yogur"],
  ["maiz", "mazorca", "choclo"],
  ["pimenton", "pimiento"],
];

/** Connectors that carry no meaning when comparing names ("harina de maíz"). */
const STOPWORDS = new Set(["de", "del", "la", "el", "los", "las", "y", "o", "con", "en"]);

/**
 * Basic Spanish singular. Only needs to be consistent on both sides of a
 * comparison; it is not a full stemmer.
 */
function singularize(word: string): string {
  if (word.length <= 3) return word;
  if (/[aeiou]ces$/.test(word)) return `${word.slice(0, -3)}z`; // nueces -> nuez
  if (/[aeiou][nlrdjs]es$/.test(word)) return word.slice(0, -2); // panes -> pan, limones -> limon
  if (word.endsWith("s") && !/[ui]s$/.test(word)) return word.slice(0, -1); // tomates -> tomate
  return word;
}

/**
 * Canonical form of a food or ingredient name: lowercase, no accents, single
 * spaces, each word in singular. Two names are "the same food" when their
 * normalized forms are equal (also used to detect duplicates).
 */
export function normalize(text: string): string {
  if (!text) return "";
  return foldText(text).split(" ").map(singularize).join(" ");
}

function toWords(normalized: string): string[] {
  return normalized.split(" ").filter((w) => w && !STOPWORDS.has(w));
}

const SYNONYMS = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  const members = group.map(normalize);
  for (const member of members) SYNONYMS.set(member, members);
}

/**
 * Whether a food (normalized name) can be used for an ingredient (normalized key).
 * Exported for tests; the app goes through `analyzeRecipe`.
 */
export function ingredientMatches(ingredientKeyNorm: string, foodNameNorm: string): boolean {
  const foodWords = new Set(toWords(foodNameNorm));
  if (foodWords.size === 0) return false;
  const alternatives = SYNONYMS.get(ingredientKeyNorm) ?? [ingredientKeyNorm];
  return alternatives.some((alternative) => {
    const words = toWords(alternative);
    return words.length > 0 && words.every((w) => foodWords.has(w));
  });
}

export interface UsedFood {
  foodId: string;
  foodName: string;
  urgency: ExpiryStatus;
  daysRemaining: number;
}

/** One recipe ingredient plus the inventory food that covers it, if any. */
export interface IngredientMatch extends RecipeIngredient {
  keyNorm: string;
  food?: UsedFood;
}

export interface RecipeAnalysis extends Recipe {
  usedFoods: UsedFood[];
  missingIngredients: Array<RecipeIngredient & { keyNorm: string }>;
  /** Every ingredient in recipe order, with its matching food when there is one. */
  ingredientMatches: IngredientMatch[];
  /** Share of required (non-optional) ingredients covered, 0-1. */
  coverage: number;
  score: number;
}

export interface RecommendedRecipe extends RecipeAnalysis {
  section: "rescue" | "withwhatyouhave";
}

interface Candidate extends UsedFood {
  nameNorm: string;
}

/** Non-expired foods, most urgent first, so each ingredient picks the food that needs rescuing most. */
function toCandidates(foods: FoodItem[], today: Date): Candidate[] {
  return foods
    .map((food) => {
      const daysRemaining = getDaysRemaining(food.expiresAt, today);
      return {
        foodId: food.id,
        foodName: food.name,
        urgency: getExpiryStatus(daysRemaining),
        daysRemaining,
        nameNorm: normalize(food.name),
      };
    })
    .filter((c) => c.urgency !== "expired") // RN-05: expired food is never recommended for cooking
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

const URGENCY_WEIGHT: Record<ExpiryStatus, number> = { critical: 5, soon: 3, fresh: 1, expired: 0 };

function analyze(recipe: Recipe, candidates: Candidate[]): RecipeAnalysis {
  const usedFoods: UsedFood[] = [];
  const ingredientMatchList: IngredientMatch[] = recipe.ingredients.map((ing) => {
    const keyNorm = normalize(ing.key || ing.label);
    const hit = candidates.find((c) => ingredientMatches(keyNorm, c.nameNorm));
    if (!hit) return { ...ing, keyNorm };
    const food: UsedFood = {
      foodId: hit.foodId,
      foodName: hit.foodName,
      urgency: hit.urgency,
      daysRemaining: hit.daysRemaining,
    };
    if (!usedFoods.some((uf) => uf.foodId === food.foodId)) usedFoods.push(food);
    return { ...ing, keyNorm, food };
  });

  const required = ingredientMatchList.filter((m) => !m.optional);
  const coverage = required.length === 0 ? 0 : required.filter((m) => m.food).length / required.length;
  const weightSum = usedFoods.reduce((sum, uf) => sum + URGENCY_WEIGHT[uf.urgency], 0);

  return {
    ...recipe,
    usedFoods,
    missingIngredients: ingredientMatchList
      .filter((m) => !m.food)
      .map((m) => ({ key: m.key, label: m.label, optional: m.optional, keyNorm: m.keyNorm })),
    ingredientMatches: ingredientMatchList,
    coverage,
    // Urgency weights plus a coverage bonus. Weights and bonus are a business rule.
    score: weightSum + coverage * 10,
  };
}

/**
 * Compares one recipe against the inventory: which ingredients are covered,
 * by which food, and what is missing. Used by the recipe detail page so it
 * always agrees with the recommendation list.
 */
export function analyzeRecipe(recipe: Recipe, foods: FoodItem[], today: Date = new Date()): RecipeAnalysis {
  return analyze(recipe, toCandidates(foods, today));
}

/**
 * Recommends recipes for the inventory (RF-09).
 * - "rescue": uses at least one critical or soon food (RN-06).
 * - "withwhatyouhave": covers at least 60 % of the required ingredients.
 * Recipes without required ingredients are skipped.
 * Sorted by score, highest first; ties keep catalog order.
 */
export function recommendRecipes(
  foods: FoodItem[],
  recipes: Recipe[],
  today: Date = new Date()
): RecommendedRecipe[] {
  const candidates = toCandidates(foods, today);
  const results: RecommendedRecipe[] = [];

  for (const recipe of recipes) {
    if (!recipe.ingredients.some((i) => !i.optional)) continue;
    const analysis = analyze(recipe, candidates);
    const rescues = analysis.usedFoods.some((uf) => uf.urgency === "critical" || uf.urgency === "soon");
    if (rescues) results.push({ ...analysis, section: "rescue" });
    else if (analysis.coverage >= 0.6) results.push({ ...analysis, section: "withwhatyouhave" });
  }

  return results.sort((a, b) => b.score - a.score);
}
