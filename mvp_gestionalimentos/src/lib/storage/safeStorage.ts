/**
 * Defensive access to `localStorage` (RNF-05).
 *
 * Everything the app persists lives in the browser, where it can be edited,
 * truncated or filled up. Reads therefore validate with Zod and never throw;
 * a damaged value is copied to a backup key before anything can overwrite it,
 * and the UI is told once so the user knows why data is missing.
 */
import { z } from "zod";

/** Damaged values are copied to `gestionalo:backup:<original key>`. */
export const BACKUP_PREFIX = "gestionalo:backup:";

export const WRITE_ERROR_MESSAGE =
  "No se pudo guardar: el almacenamiento del navegador está lleno o no disponible.";

type IssueListener = (key: string) => void;
const listeners = new Set<IssueListener>();
// A corrupt key is re-read on every load until it is overwritten; warn once per page load.
const reported = new Set<string>();

/** Subscribes to "a stored value was damaged" events. Returns the unsubscribe function. */
export function onStorageIssue(listener: IssueListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `localStorage`, or null when rendering on the server or when the browser blocks it. */
export function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function quarantine(storage: Storage, key: string, raw: string): void {
  try {
    storage.setItem(`${BACKUP_PREFIX}${key}`, raw);
  } catch {
    // Storage is full: the original value is still in place, nothing else to do.
  }
  if (reported.has(key)) return;
  reported.add(key);
  listeners.forEach((listener) => listener(key));
}

function readRaw(key: string): { storage: Storage; raw: string } | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : { storage, raw };
  } catch {
    return null;
  }
}

/** Reads and validates one JSON value. Returns `fallback` when missing or damaged. */
export function readJson<T>(key: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>, fallback: T): T {
  const found = readRaw(key);
  if (!found) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(found.raw));
    if (parsed.success) return parsed.data;
  } catch {
    // Not JSON: handled below like any other damaged value.
  }
  quarantine(found.storage, key, found.raw);
  return fallback;
}

/**
 * Reads a JSON array keeping every valid item. One damaged item must not hide
 * the rest of the inventory, so invalid items are dropped (after a backup of
 * the whole original value) instead of discarding the list.
 */
export function readJsonList<T>(key: string, itemSchema: z.ZodType<T, z.ZodTypeDef, unknown>): T[] {
  const found = readRaw(key);
  if (!found) return [];
  let data: unknown;
  try {
    data = JSON.parse(found.raw);
  } catch {
    data = null;
  }
  if (!Array.isArray(data)) {
    quarantine(found.storage, key, found.raw);
    return [];
  }
  const items: T[] = [];
  for (const entry of data) {
    const parsed = itemSchema.safeParse(entry);
    if (parsed.success) items.push(parsed.data);
  }
  if (items.length !== data.length) quarantine(found.storage, key, found.raw);
  return items;
}

/** Writes a JSON value. Throws a user-facing error so callers never lose data silently. */
export function writeJson(key: string, value: unknown): void {
  const storage = getStorage();
  try {
    if (!storage) throw new Error("unavailable");
    storage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(WRITE_ERROR_MESSAGE);
  }
}

/** Removes a key; a blocked storage is ignored because there is nothing to remove. */
export function removeKey(key: string): void {
  try {
    getStorage()?.removeItem(key);
  } catch {
    // ignore
  }
}

/** Test helper: forget which keys were already reported. */
export function resetStorageIssues(): void {
  reported.clear();
}
