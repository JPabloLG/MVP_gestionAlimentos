import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FoodFormModal } from '../inventory/FoodFormModal';
import { ToastProvider } from '@/context/ToastProvider';
import { dateInDays } from '@/lib/expiry';

const addFood = vi.fn(async () => true);

vi.mock('@/hooks/useFoods', () => ({
  useFoods: () => ({ foods: [], addFood, updateFood: vi.fn(async () => true) }),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));

function setViewport(desktop: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('min-width') ? desktop : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {}, // legacy API still used by framer-motion
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

let root: Root;
let host: HTMLElement;

async function open(desktop: boolean) {
  setViewport(desktop);
  await act(async () => {
    root.render(
      <ToastProvider>
        <FoodFormModal isOpen onClose={() => {}} />
      </ToastProvider>
    );
  });
}

function button(text: string) {
  const found = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === text);
  if (!found) throw new Error(`No button "${text}"`);
  return found;
}

function field(name: string) {
  const found = document.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);
  if (!found) throw new Error(`No field "${name}"`);
  return found;
}

/** Sets a value the way a user would, so React and React Hook Form both notice. */
async function type(el: HTMLInputElement | HTMLSelectElement, value: string) {
  const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value);
  await act(async () => {
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  addFood.mockClear();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe('FoodFormModal (RF-03)', () => {
  it.each([
    ['desktop', true],
    ['mobile', false],
  ])('renders a single form on %s and date shortcuts update the visible field', async (_name, desktop) => {
    await open(desktop);
    const dates = document.querySelectorAll<HTMLInputElement>('input[name="expiresAt"]');
    expect(document.querySelectorAll('form')).toHaveLength(1);
    expect(dates).toHaveLength(1);

    await act(async () => button('+3 días').click());
    expect(dates[0].value).toBe(dateInDays(3));
  });

  it('offers the five date shortcuts and starts with the cursor on the name (M1)', async () => {
    await open(true);
    for (const label of ['Hoy', '+3 días', '+1 semana', '+2 semanas', '+1 mes']) expect(button(label)).toBeTruthy();
    expect(document.activeElement).toBe(field('name'));
  });

  it('"add another" keeps the form open, clears it and remembers unit and category (M1)', async () => {
    await open(true);
    await type(field('name'), 'Leche');
    await type(field('unit'), 'l');
    await act(async () => document.querySelector<HTMLInputElement>('input[type="radio"][value="lacteos"]')!.click());
    await act(async () => button('Hoy').click());
    await act(async () => document.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await act(async () => button('Agregar').click());

    expect(addFood).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Leche', unit: 'l', category: 'lacteos', expiresAt: dateInDays(0) })
    );
    expect(field('name').value).toBe('');
    expect(field('unit').value).toBe('l');
    expect(document.querySelector<HTMLInputElement>('input[type="radio"]:checked')!.value).toBe('lacteos');
    expect(document.activeElement).toBe(field('name'));
  });

  it('suggests an estimated date by category and saves it flagged; typing a date clears the flag (M2)', async () => {
    await open(true);
    await type(field('name'), 'Pollo');
    await act(async () => document.querySelector<HTMLInputElement>('input[type="radio"][value="carnes"]')!.click());
    await act(async () => button('No sé la fecha: sugerir según la categoría').click());
    expect(field('expiresAt').value).toBe(dateInDays(2));
    expect(document.body.textContent).toContain('Fecha estimada');

    await act(async () => button('Agregar').click());
    expect(addFood).toHaveBeenLastCalledWith(expect.objectContaining({ expiresAt: dateInDays(2), expiryIsEstimated: true }));

    await open(true);
    await act(async () => button('No sé la fecha: sugerir según la categoría').click());
    await type(field('expiresAt'), dateInDays(9));
    expect(document.body.textContent).not.toContain('Fecha estimada');
  });

  it('has no duplicated ids, so every label points at its own field', async () => {
    await open(true);
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
