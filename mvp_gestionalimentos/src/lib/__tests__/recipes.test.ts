import { describe, it, expect } from 'vitest';
import { analyzeRecipe, ingredientMatches, normalize, recommendRecipes } from '../recipes';
import { dateInDays } from '../expiry';
import { recipes } from '@/data/recipes';
import { FoodItem, Recipe } from '@/types';

const today = new Date(2026, 9, 28);

function food(name: string, daysLeft: number): FoodItem {
  return {
    id: name,
    userId: 'u1',
    name,
    quantity: 1,
    unit: 'unidades',
    category: 'otros',
    expiresAt: dateInDays(daysLeft, today),
    createdAt: '',
    updatedAt: '',
  };
}

function recipe(id: string, required: string[], optional: string[] = []): Recipe {
  return {
    id,
    title: id,
    description: '',
    timeMinutes: 10,
    servings: 1,
    difficulty: 'facil',
    emoji: '',
    ingredients: [
      ...required.map((key) => ({ key, label: key })),
      ...optional.map((key) => ({ key, label: key, optional: true })),
    ],
    steps: [],
  };
}

const matches = (ingredient: string, foodName: string) =>
  ingredientMatches(normalize(ingredient), normalize(foodName));

describe('normalize', () => {
  it('normalizes tomatoes vs tomate', () => {
    expect(normalize('Tomates')).toBe(normalize('tomate'));
  });

  it.each([
    ['tomates', 'tomate'],
    ['panes', 'pan'],
    ['nueces', 'nuez'],
    ['arroces', 'arroz'],
    ['lentejas', 'lenteja'],
    ['limones', 'limon'],
    ['Fríjoles', 'frijol'],
    ['carnes', 'carne'],
    ['Plátanos  Maduros', 'platano maduro'],
  ])('%s -> %s', (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });
});

describe('ingredient matching by whole word (RF-09)', () => {
  it.each([
    ['pan', 'Panela'],
    ['panela', 'Pan'],
    ['sal', 'Salchicha'],
    ['ajo', 'Ajonjolí'],
    ['res', 'Fresa'],
    ['fresa', 'Res'],
    ['col', 'Chocolate'],
    ['te', 'Tomate'],
    ['tomate', 'Té'],
    ['agua', 'Aguacate'],
    ['papa', 'Papaya'],
    ['harina de maiz', 'Maíz'],
  ])('ingredient "%s" does not match food "%s"', (ingredient, foodName) => {
    expect(matches(ingredient, foodName)).toBe(false);
  });

  it.each([
    ['tomate', 'Tomates'],
    ['pan', 'Panes'],
    ['limon', 'Limones'],
    ['pollo', 'Pechuga de pollo'],
    ['cebolla', 'Cebolla larga'],
    ['leche', 'Leche entera'],
    ['huevo', 'Huevos'],
    ['harina de maiz', 'Harina de maíz precocida'],
    ['banano', 'Plátano'],
    ['plátano maduro', 'Banano'],
    ['papa', 'Patatas'],
    ['yogurt', 'Yogur griego'],
  ])('ingredient "%s" matches food "%s"', (ingredient, foodName) => {
    expect(matches(ingredient, foodName)).toBe(true);
  });

  it('an avocado no longer counts as water in the real catalog', () => {
    const ids = recommendRecipes([food('Aguacate', 2)], recipes, today).map((r) => r.id);
    expect(ids).toEqual(['pan-tostado-con-aguacate', 'aguacate-relleno']);
  });
});

describe('recommendRecipes', () => {
  it('recommends recipe with critical ingredient above fresh', () => {
    const recs = recommendRecipes([food('Tomate', 1), food('Lechuga', 13)], recipes, today);
    const huevosPericos = recs.find((r) => r.id === 'huevos-pericos');
    expect(huevosPericos).toBeDefined();
    expect(huevosPericos?.section).toBe('rescue');
  });

  it('ignores expired foods', () => {
    expect(recommendRecipes([food('Tomate', -1)], [recipe('r', ['tomate'])], today)).toEqual([]);
  });

  it('optional ingredients do not change coverage', () => {
    const [rec] = recommendRecipes([food('Arroz', 30)], [recipe('r', ['arroz'], ['ajo', 'cebolla'])], today);
    expect(rec.coverage).toBe(1);
    expect(rec.missingIngredients.map((m) => m.key)).toEqual(['ajo', 'cebolla']);
  });

  it('the 60 % threshold is inclusive', () => {
    const five = recipe('r', ['arroz', 'pasta', 'queso', 'leche', 'miel']);
    const have = (n: number) => ['Arroz', 'Pasta', 'Queso'].slice(0, n).map((name) => food(name, 30));
    expect(recommendRecipes(have(3), [five], today)[0]?.section).toBe('withwhatyouhave');
    expect(recommendRecipes(have(2), [five], today)).toEqual([]);
  });

  it('scores with weights critical 5, soon 3, fresh 1 plus coverage x 10', () => {
    const [rec] = recommendRecipes(
      [food('Tomate', 0), food('Queso', 4), food('Arroz', 30)],
      [recipe('r', ['tomate', 'queso', 'arroz', 'miel'])],
      today
    );
    expect(rec.score).toBeCloseTo(5 + 3 + 1 + 0.75 * 10);
  });

  it('uses the most urgent food when several match an ingredient', () => {
    const analysis = analyzeRecipe(recipe('r', ['leche']), [food('Leche entera', 20), food('Leche', 1)], today);
    expect(analysis.usedFoods.map((u) => u.foodName)).toEqual(['Leche']);
  });

  it('ranks every rescue recipe above fresh-only recipes, even with a lower score (RN-06)', () => {
    const foods = [food('Tomate', 0), food('Yogurt', 30), food('Papa', 30), food('Leche', 30)];
    const recs = recommendRecipes(foods, recipes, today);
    const firstNonRescue = recs.findIndex((r) => r.section !== 'rescue');
    expect(recs[0].section).toBe('rescue');
    expect(recs.slice(firstNonRescue).every((r) => r.section === 'withwhatyouhave')).toBe(true);
    // The audit case: these two used to open the list with scores 12 and 11.
    const best = Math.max(...recs.filter((r) => r.section === 'withwhatyouhave').map((r) => r.score));
    expect(best).toBeGreaterThan(recs[0].score);
  });

  it('is deterministic: ties keep catalog order', () => {
    const catalog = [recipe('a', ['arroz']), recipe('b', ['arroz'])];
    const run = () => recommendRecipes([food('Arroz', 30)], catalog, today).map((r) => r.id);
    expect(run()).toEqual(['a', 'b']);
    expect(run()).toEqual(run());
  });
});

describe('analyzeRecipe (RF-10)', () => {
  it('splits ingredients into what I have and what is missing, skipping expired food', () => {
    const analysis = analyzeRecipe(
      recipe('r', ['tomate', 'cebolla', 'ajo']),
      [food('Tomate', 1), food('Cebolla', -2)],
      today
    );
    expect(analysis.ingredientMatches.map((m) => m.food?.foodName)).toEqual(['Tomate', undefined, undefined]);
    expect(analysis.missingIngredients.map((m) => m.key)).toEqual(['cebolla', 'ajo']);
    expect(analysis.coverage).toBeCloseTo(1 / 3);
  });
});
