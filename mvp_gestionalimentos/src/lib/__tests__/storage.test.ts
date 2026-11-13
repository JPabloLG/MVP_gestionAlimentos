import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalAuthRepository } from '../storage/localAuthRepository';
import { LocalFoodRepository } from '../storage/localFoodRepository';
import { BACKUP_PREFIX, onStorageIssue, resetStorageIssues, WRITE_ERROR_MESSAGE } from '../storage/safeStorage';
import { FoodItem } from '@/types';

// jsdom provides an in-memory `localStorage`; it is wiped before every test.
const auth = new LocalAuthRepository();
const foods = new LocalFoodRepository();

function food(id: string, userId: string, patch: Partial<FoodItem> = {}): FoodItem {
  return {
    id,
    userId,
    name: 'Leche',
    quantity: 1,
    unit: 'l',
    category: 'lacteos',
    expiresAt: '2026-10-30',
    notes: '',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...patch,
  };
}

beforeEach(() => {
  localStorage.clear();
  resetStorageIssues();
});

describe('safe reads (RNF-05)', () => {
  it('backs up a corrupt value instead of losing it, and reports it once', async () => {
    const listener = vi.fn();
    const unsubscribe = onStorageIssue(listener);
    localStorage.setItem('gestionalo:foods:u1', '{not json');

    expect(await foods.getFoods('u1')).toEqual([]);
    expect(await foods.getFoods('u1')).toEqual([]);

    expect(localStorage.getItem(`${BACKUP_PREFIX}gestionalo:foods:u1`)).toBe('{not json');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('keeps the valid foods when one item is damaged', async () => {
    const raw = JSON.stringify([food('ok', 'u1'), { id: 'bad', userId: 'u1', name: 'x' }, food('nan', 'u1', { expiresAt: 'hola' })]);
    localStorage.setItem('gestionalo:foods:u1', raw);

    expect((await foods.getFoods('u1')).map((f) => f.id)).toEqual(['ok']);
    expect(localStorage.getItem(`${BACKUP_PREFIX}gestionalo:foods:u1`)).toBe(raw);
  });

  it('treats a non-array value as damaged', async () => {
    localStorage.setItem('gestionalo:foods:u1', '{}');
    expect(await foods.getFoods('u1')).toEqual([]);
    await foods.addFood(food('a', 'u1'));
    expect((await foods.getFoods('u1')).map((f) => f.id)).toEqual(['a']);
  });

  it('falls back to zero stats and no session on damaged values', async () => {
    localStorage.setItem('gestionalo:stats:u1', '{"rescued":"muchos"}');
    localStorage.setItem('gestionalo:session', 'null');
    expect(foods.getStats('u1')).toEqual({ rescued: 0, wasted: 0 });
    expect(await auth.getSession()).toBeNull();
  });

  it('surfaces a readable error when the browser refuses to write', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    await expect(foods.addFood(food('a', 'u1'))).rejects.toThrow(WRITE_ERROR_MESSAGE);
    spy.mockRestore();
  });
});
