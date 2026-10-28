import { describe, it, expect } from 'vitest';
import { normalize, recommendRecipes } from '../recipes';
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
});
