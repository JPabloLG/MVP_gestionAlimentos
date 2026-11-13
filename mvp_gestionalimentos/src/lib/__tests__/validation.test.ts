import { describe, it, expect } from 'vitest';
import { foodSchema } from '../validation/food';
import { loginSchema, registerSchema } from '../validation/auth';
import { isValidDateString, dateInDays } from '../expiry';

const food = { name: 'Leche', quantity: 1, unit: 'l', category: 'lacteos', expiresAt: '2026-10-28', notes: '' };
const account = { name: 'Ana', email: 'ana@correo.co', password: '12345678', confirmPassword: '12345678', acceptTerms: true };

describe('foodSchema (RF-03)', () => {
  it('accepts a valid food and trims the name', () => {
    const result = foodSchema.safeParse({ ...food, name: '  Leche  ' });
    expect(result.success && result.data.name).toBe('Leche');
  });

  it.each([
    ['blank name', { name: '   ' }],
    ['1-char name', { name: 'a' }],
    ['61-char name', { name: 'a'.repeat(61) }],
    ['zero quantity', { quantity: 0 }],
    ['negative quantity', { quantity: -1 }],
    ['NaN quantity', { quantity: NaN }],
    ['121-char notes', { notes: 'a'.repeat(121) }],
    ['free-text date', { expiresAt: 'hola' }],
    ['impossible date', { expiresAt: '2026-02-31' }],
    ['unknown unit', { unit: 'litros' }],
  ])('rejects %s', (_label, patch) => {
    expect(foodSchema.safeParse({ ...food, ...patch }).success).toBe(false);
  });

  it('accepts the limits: 2 and 60 chars, 120-char notes, past dates', () => {
    expect(foodSchema.safeParse({ ...food, name: 'ab' }).success).toBe(true);
    expect(foodSchema.safeParse({ ...food, name: 'a'.repeat(60), notes: 'n'.repeat(120) }).success).toBe(true);
    expect(foodSchema.safeParse({ ...food, expiresAt: '2020-01-01' }).success).toBe(true);
  });
});

describe('auth schemas (RF-01, RF-02)', () => {
  it('trims the email instead of rejecting it', () => {
    const result = registerSchema.safeParse({ ...account, email: '  ana@correo.co ' });
    expect(result.success && result.data.email).toBe('ana@correo.co');
    expect(loginSchema.safeParse({ email: ' ana@correo.co ', password: 'x' }).success).toBe(true);
  });

  it.each([
    ['blank name', { name: '  ' }],
    ['short password', { password: '1234567', confirmPassword: '1234567' }],
    ['terms not accepted', { acceptTerms: false }],
    ['bad email', { email: 'ana' }],
  ])('rejects %s', (_label, patch) => {
    expect(registerSchema.safeParse({ ...account, ...patch }).success).toBe(false);
  });

  it('does not require a confirmation password', () => {
    const registration = {
      name: account.name,
      email: account.email,
      password: account.password,
      acceptTerms: account.acceptTerms,
    };
    expect(registerSchema.safeParse(registration).success).toBe(true);
  });
});

describe('date helpers', () => {
  it('validates real calendar dates only', () => {
    expect(isValidDateString('2028-02-29')).toBe(true);
    expect(isValidDateString('2027-02-29')).toBe(false);
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });

  it('adds calendar days across month and year ends', () => {
    expect(dateInDays(3, new Date(2026, 9, 30, 23, 59))).toBe('2026-11-02');
    expect(dateInDays(1, new Date(2026, 11, 31))).toBe('2027-01-01');
    expect(dateInDays(-1, new Date(2026, 2, 1))).toBe('2026-02-28');
  });
});
