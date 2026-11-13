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

describe('accounts (RF-01, RF-02, RNF-03)', () => {
  it('registers, never stores the password, and signs in', async () => {
    const user = await auth.register(' Ana ', ' Ana@Correo.co ', 'secreta123');
    expect(user).toMatchObject({ name: 'Ana', email: 'ana@correo.co' });
    expect(Object.keys(user).sort()).toEqual(['createdAt', 'email', 'id', 'name']);
    expect(localStorage.getItem('gestionalo:users')).not.toContain('secreta123');

    const session = await auth.login('ANA@correo.co', 'secreta123');
    expect(session.userId).toBe(user.id);
    expect(await auth.getSession()).toEqual(session);
  });

  it('detects a duplicated email ignoring case and spaces', async () => {
    await auth.register('Ana', 'ana@correo.co', 'secreta123');
    await expect(auth.register('Otra', '  ANA@Correo.CO ', 'secreta123')).rejects.toThrow('El correo ya está registrado');
  });

  it('gives the same error for an unknown email and a wrong password', async () => {
    await auth.register('Ana', 'ana@correo.co', 'secreta123');
    const wrongPassword = await auth.login('ana@correo.co', 'otra-clave').catch((e: Error) => e.message);
    const unknownEmail = await auth.login('nadie@correo.co', 'secreta123').catch((e: Error) => e.message);
    expect(wrongPassword).toBe('Credenciales inválidas');
    expect(unknownEmail).toBe(wrongPassword);
  });

  it('logout removes only the session (RNF-05)', async () => {
    const user = await auth.register('Ana', 'ana@correo.co', 'secreta123');
    await auth.login('ana@correo.co', 'secreta123');
    await foods.addFood(food('a', user.id));
    await auth.logout();

    expect(await auth.getSession()).toBeNull();
    expect(await foods.getFoods(user.id)).toHaveLength(1);
    expect(await auth.getUserById(user.id)).not.toBeNull();
  });
});

describe('isolation between users (RN-01, RN-02)', () => {
  beforeEach(async () => {
    await foods.addFood(food('a1', 'ana'));
    await foods.addFood(food('b1', 'beto', { name: 'Pan' }));
    foods.updateStats('ana', { rescued: 3, wasted: 1 });
  });

  it('each user only sees their own foods and stats', async () => {
    expect((await foods.getFoods('ana')).map((f) => f.id)).toEqual(['a1']);
    expect((await foods.getFoods('beto')).map((f) => f.id)).toEqual(['b1']);
    expect(foods.getStats('beto')).toEqual({ rescued: 0, wasted: 0 });
  });

  it('cannot delete or edit a food that belongs to someone else', async () => {
    await foods.deleteFood('a1', 'beto');
    await expect(foods.updateFood(food('a1', 'beto', { name: 'Robado' }))).rejects.toThrow();

    expect(await foods.getFoods('ana')).toEqual([food('a1', 'ana')]);
    expect((await foods.getFoods('beto')).map((f) => f.id)).toEqual(['b1']);
  });

  it('ignores foods of another user planted under my key', async () => {
    localStorage.setItem('gestionalo:foods:ana', JSON.stringify([food('a1', 'ana'), food('x', 'beto')]));
    expect((await foods.getFoods('ana')).map((f) => f.id)).toEqual(['a1']);
  });

  it('updates a food in place and refreshes updatedAt', async () => {
    const updated = await foods.updateFood(food('a1', 'ana', { quantity: 2 }));
    expect(updated.quantity).toBe(2);
    expect(updated.updatedAt).not.toBe('2026-10-01T10:00:00.000Z');
    expect(await foods.getFoods('ana')).toHaveLength(1);
  });
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
