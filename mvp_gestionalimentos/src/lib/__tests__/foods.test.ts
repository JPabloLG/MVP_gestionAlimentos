import { describe, it, expect } from 'vitest';
import { buildDemoFoods, findDuplicates, missingDemoFoods, suggestExpiryDate } from '../foods';
import { estimatedShelfLifeDays } from '@/data/shelfLife';
import { foodCategories } from '../validation/food';
import { getDaysRemaining, getExpiryStatus } from '../expiry';
import { foodSchema } from '../validation/food';
import { FoodItem, NewFood } from '@/types';

const today = new Date(2026, 9, 28);

const asItem = (food: NewFood, i: number): FoodItem => ({
  ...food,
  id: String(i),
  userId: 'u1',
  createdAt: '',
  updatedAt: '',
});

describe('demo foods', () => {
  it('cover the four traffic light states relative to today', () => {
    const states = new Set(buildDemoFoods(today).map((f) => getExpiryStatus(getDaysRemaining(f.expiresAt, today))));
    expect([...states].sort()).toEqual(['critical', 'expired', 'fresh', 'soon']);
  });

  it('are valid foods', () => {
    for (const f of buildDemoFoods(today)) expect(foodSchema.safeParse(f).success).toBe(true);
  });

  it('loading twice adds nothing the second time', () => {
    const first = missingDemoFoods([], today);
    expect(first).toHaveLength(11);
    expect(missingDemoFoods(first.map(asItem), today)).toEqual([]);
  });

  it('skips foods the user already has, ignoring plurals, case and accents', () => {
    const mine = [asItem({ name: 'TOMATES', quantity: 1, unit: 'kg', category: 'verduras', expiresAt: '2026-11-01' }, 0)];
    const names = missingDemoFoods(mine, today).map((f) => f.name);
    expect(names).not.toContain('Tomate');
    expect(names).toHaveLength(10);
  });
});

describe('estimated spoilage date (M2, RF-03)', () => {
  it('suggests a future date for every category', () => {
    for (const category of foodCategories) {
      const days = getDaysRemaining(suggestExpiryDate(category, today), today);
      expect(days).toBe(estimatedShelfLifeDays[category]);
      expect(days).toBeGreaterThan(0);
    }
  });

  it('perishables get shorter estimates than pantry items', () => {
    expect(estimatedShelfLifeDays.carnes).toBeLessThan(estimatedShelfLifeDays.lacteos);
    expect(estimatedShelfLifeDays.frutas).toBeLessThan(estimatedShelfLifeDays.despensa);
  });
});

describe('duplicate detection (M3)', () => {
  const have = [
    asItem({ name: 'Leche', quantity: 1, unit: 'l', category: 'lacteos', expiresAt: '2026-11-10' }, 1),
    asItem({ name: 'Tomates', quantity: 6, unit: 'unidades', category: 'verduras', expiresAt: '2026-10-29' }, 2),
    asItem({ name: 'leche', quantity: 2, unit: 'l', category: 'lacteos', expiresAt: '2026-10-30' }, 3),
  ];

  it('finds the same food ignoring case, accents, spaces and plurals', () => {
    expect(findDuplicates('  TOMATE ', have, today).map((f) => f.id)).toEqual(['2']);
  });

  it('returns every match with the most urgent first', () => {
    expect(findDuplicates('Leche', have, today).map((f) => f.id)).toEqual(['3', '1']);
  });

  it('does not confuse different foods that share letters', () => {
    expect(findDuplicates('Leche de coco', have, today)).toEqual([]);
    expect(findDuplicates('Tomatillo', have, today)).toEqual([]);
    expect(findDuplicates('', have, today)).toEqual([]);
  });
});
