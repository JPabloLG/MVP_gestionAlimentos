import { ExpiryStatus, FoodItem } from "@/types";
import { getDaysRemaining, getExpiryStatus } from "./expiry";

export interface StatsSummary {
  total: number;
  expired: number;
  critical: number;
  soon: number;
  fresh: number;
  rescued: number;
  wasted: number;
}

export function calculateStats(
  foods: FoodItem[],
  userStats: { rescued: number; wasted: number },
  today: Date = new Date()
): StatsSummary {
  let expired = 0,
    critical = 0,
    soon = 0,
    fresh = 0;

  for (const food of foods) {
    const days = getDaysRemaining(food.expiresAt, today);
    const status = getExpiryStatus(days);
    if (status === "expired") expired++;
    else if (status === "critical") critical++;
    else if (status === "soon") soon++;
    else if (status === "fresh") fresh++;
  }

  return {
    total: foods.length,
    expired,
    critical,
    soon,
    fresh,
    rescued: userStats.rescued || 0,
    wasted: userStats.wasted || 0,
  };
}
