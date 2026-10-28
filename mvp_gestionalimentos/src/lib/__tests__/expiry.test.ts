import { describe, it, expect } from 'vitest';
import { getDaysRemaining, getExpiryStatus, getExpiryLabel, sortByPriority } from '../expiry';

describe('expiry', () => {
  it('calculates days remaining for today', () => {
    const today = new Date(2026, 9, 28); // Oct 28, 2026 local
    const days = getDaysRemaining('2026-10-28', today);
    expect(days).toBe(0);
  });

  it('calculates days with month/year change', () => {
    const today = new Date(2026, 9, 28);
    const days = getDaysRemaining('2026-11-01', today);
    expect(days).toBe(4);
    const days2 = getDaysRemaining('2027-01-01', today);
    expect(days2).toBeGreaterThan(60);
  });

  it('classifies status at boundaries', () => {
    expect(getExpiryStatus(-1)).toBe('expired');
    expect(getExpiryStatus(0)).toBe('critical');
    expect(getExpiryStatus(2)).toBe('critical');
    expect(getExpiryStatus(3)).toBe('soon');
    expect(getExpiryStatus(5)).toBe('soon');
    expect(getExpiryStatus(6)).toBe('fresh');
  });

  it('labels correctly', () => {
    expect(getExpiryLabel(-2)).toBe('Venció hace 2 días');
    expect(getExpiryLabel(0)).toBe('Vence hoy');
    expect(getExpiryLabel(1)).toBe('Vence mañana');
    expect(getExpiryLabel(4)).toBe('Vence en 4 días');
  });

  it('sorts by priority (expired first, then closest)', () => {
    const today = new Date(2026, 9, 28);
    const items = [
      { id: '1', expiresAt: '2026-10-30' },
      { id: '2', expiresAt: '2026-10-27' }, // expired
      { id: '3', expiresAt: '2026-10-28' }, // today
    ];
    const sorted = sortByPriority(items, today);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1');
  });
});
