import { describe, it, expect } from 'vitest';
import { getRecipeInsights, matchesIngredient, normalize, recommendRecipes } from '../recipes';
import { recipes } from '@/data/recipes';
import { FoodItem } from '@/types';

describe('recipes', () => {
  it('normalizes tomatoes vs tomate', () => {
    expect(normalize('Tomates')).toBe(normalize('tomate'));
  });

  it('recommends recipe with critical ingredient above fresh', () => {
    const today = new Date(2026, 9, 28);
    const foods: FoodItem[] = [
      {
        id: '1',
        userId: 'u1',
        name: 'Tomate',
        quantity: 1,
        unit: 'unidades',
        category: 'verduras',
        expiresAt: '2026-10-29', // critical (1 day)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'u1',
        name: 'Lechuga',
        quantity: 1,
        unit: 'unidades',
        category: 'verduras',
        expiresAt: '2026-11-10', // fresh
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    const recs = recommendRecipes(foods, recipes, today);
    // Huevos pericos uses tomato (critical) - should be in rescue
    const huevosPericos = recs.find((r) => r.id === 'huevos-pericos');
    expect(huevosPericos).toBeDefined();
    expect(huevosPericos?.section).toBe('rescue');
  });

  it("matches ingredient phrases and simple plurals without partial-word false positives", () => {
    expect(matchesIngredient("tomate", "Tomates picados")).toBe(true);
    expect(matchesIngredient("tomate picado", "Tomate")).toBe(true);
    expect(matchesIngredient("sal", "ensalada")).toBe(false);
  });

  it("prioritizes ingredients expiring within three days and excludes expired food", () => {
    const today = new Date(2026, 9, 28);
    const food = (id: string, name: string, expiresAt: string): FoodItem => ({
      id,
      userId: "u1",
      name,
      quantity: 1,
      unit: "unidades",
      category: "verduras",
      expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const testRecipes = [
      {
        id: "tomato",
        title: "Receta de tomate",
        description: "",
        timeMinutes: 5,
        servings: 1,
        difficulty: "facil" as const,
        emoji: "🍅",
        ingredients: [{ key: "tomate", label: "Tomate" }],
        steps: [],
      },
      {
        id: "onion",
        title: "Receta de cebolla",
        description: "",
        timeMinutes: 5,
        servings: 1,
        difficulty: "facil" as const,
        emoji: "🧅",
        ingredients: [{ key: "cebolla", label: "Cebolla" }],
        steps: [],
      },
    ];
    const insights = getRecipeInsights(
      [
        food("urgent", "Tomates picados", "2026-10-31"),
        food("expired", "Cebolla", "2026-10-27"),
      ],
      testRecipes,
      today
    );

    expect(insights[0].id).toBe("tomato");
    expect(insights[0].urgentFoods[0].daysRemaining).toBe(3);
    expect(insights[0].matchedIngredients).toBe(1);
    expect(insights[0].requiredIngredients).toBe(1);
    expect(insights[0].readyToCook).toBe(true);
    expect(insights.find((recipe) => recipe.id === "onion")?.usedFoods).toHaveLength(0);
    expect(insights.find((recipe) => recipe.id === "onion")?.coverage).toBe(0);
  });
});
