/**
 * Expiry rules (RF-07, RF-08, RN-03, RN-04, RN-05).
 *
 * Dates are stored as local "YYYY-MM-DD" strings and compared by local
 * calendar day. They are never parsed with the ISO string constructor of
 * `Date`: that yields UTC midnight, which is the previous day in UTC-5.
 */
import { ExpiryStatus } from "@/types";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseLocalDateYYYYMMDD(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  return new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * True only for a real calendar date written as "YYYY-MM-DD".
 * Rejects overflow such as "2026-02-31", which `Date` would silently roll over,
 * so an invalid date can never reach the traffic light as `NaN` days.
 */
export function isValidDateString(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  return year >= 2000 && year <= 2100 && date.getMonth() === month - 1 && date.getDate() === day;
}

/** Formats a date as the local "YYYY-MM-DD" string used in storage and date inputs. */
export function toLocalDateString(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** Local date string `days` calendar days from `today` (negative for the past). */
export function dateInDays(days: number, today: Date = new Date()): string {
  return toLocalDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() + days));
}

/** Whole calendar days until `expiresAt`; negative once the date has passed (RN-03). */
export function getDaysRemaining(expiresAt: string, today: Date = new Date()): number {
  const expiryStart = startOfLocalDay(parseLocalDateYYYYMMDD(expiresAt));
  const diffMs = expiryStart.getTime() - startOfLocalDay(today).getTime();
  // Both ends are local midnights, so rounding only absorbs DST hour shifts.
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Traffic light: expired < 0, critical 0-2, soon 3-5, fresh > 5. Thresholds are a business rule. */
export function getExpiryStatus(days: number): ExpiryStatus {
  if (days < 0) return "expired";
  if (days <= 2) return "critical";
  if (days <= 5) return "soon";
  return "fresh";
}

/** Human text for the remaining days, so urgency never depends on color alone. */
export function getExpiryLabel(days: number): string {
  if (days < 0) {
    const abs = Math.abs(days);
    return abs === 1 ? "Venció hace 1 día" : `Venció hace ${abs} días`;
  }
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  return `Vence en ${days} días`;
}

/** Most urgent first (expired, then closest date). Stable: ties keep their input order. */
export function sortByPriority<T extends { expiresAt: string }>(items: T[], today: Date = new Date()): T[] {
  return items
    .map((item) => ({ item, days: getDaysRemaining(item.expiresAt, today) }))
    .sort((a, b) => a.days - b.days)
    .map((x) => x.item);
}
