import { ExpiryStatus } from "@/types";

function parseLocalDateYYYYMMDD(dateStr: string): Date {
  // Parse "YYYY-MM-DD" as a local date (not UTC)
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  // month is 0-based in JS Date
  return new Date(year, month - 1, day);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getDaysRemaining(expiresAt: string, today: Date = new Date()): number {
  const expiryDate = parseLocalDateYYYYMMDD(expiresAt);
  const todayStart = startOfLocalDay(today);
  const expiryStart = startOfLocalDay(expiryDate);
  const diffMs = expiryStart.getTime() - todayStart.getTime();
  // difference in calendar days
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getExpiryStatus(days: number): ExpiryStatus {
  if (days < 0) return "expired";
  if (days >= 0 && days <= 2) return "critical";
  if (days >= 3 && days <= 5) return "soon";
  // days > 5
  return "fresh";
}

export function getExpiryLabel(days: number): string {
  if (days < 0) {
    const abs = Math.abs(days);
    if (abs === 1) return "Venció hace 1 día";
    return `Venció hace ${abs} días`;
  }
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  if (days > 1) return `Vence en ${days} días`;
  return `Vence en ${days} días`;
}

export function sortByPriority<T extends { expiresAt: string }>(
  items: T[],
  today: Date = new Date()
): T[] {
  const itemsWithDays = items.map((item) => ({
    item,
    days: getDaysRemaining(item.expiresAt, today),
  }));
  itemsWithDays.sort((a, b) => {
    if (a.days !== b.days) {
      return a.days - b.days; // vencidos primero, luego más cercanos
    }
    return 0;
  });
  return itemsWithDays.map((x) => x.item);
}
