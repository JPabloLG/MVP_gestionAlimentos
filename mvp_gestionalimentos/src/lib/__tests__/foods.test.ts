import { describe, it, expect } from 'vitest';
import { buildDemoFoods, missingDemoFoods } from '../foods';
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
