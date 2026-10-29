import { FoodRepository } from "./foodRepository";
import { FoodItem, UserStats } from "@/types";

const FOODS_KEY_PREFIX = "gestionalo:foods:";
const STATS_KEY_PREFIX = "gestionalo:stats:";

export class LocalFoodRepository implements FoodRepository {
  private foodsKey(userId: string) {
    return `${FOODS_KEY_PREFIX}${userId}`;
  }

  private statsKey(userId: string) {
    return `${STATS_KEY_PREFIX}${userId}`;
  }

  async getFoods(userId: string): Promise<FoodItem[]> {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(this.foodsKey(userId));
      if (!raw) return [];
      return JSON.parse(raw) as FoodItem[];
    } catch {
      return [];
    }
  }

  private saveFoods(userId: string, foods: FoodItem[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.foodsKey(userId), JSON.stringify(foods));
  }

  async addFood(food: FoodItem): Promise<FoodItem> {
    const foods = await this.getFoods(food.userId);
    foods.push(food);
    this.saveFoods(food.userId, foods);
    return food;
  }

  async updateFood(food: FoodItem): Promise<FoodItem> {
    const foods = await this.getFoods(food.userId);
    const idx = foods.findIndex((f) => f.id === food.id && f.userId === food.userId);
    if (idx >= 0) {
      foods[idx] = { ...food, updatedAt: new Date().toISOString() };
      this.saveFoods(food.userId, foods);
      return foods[idx];
    } else {
      foods.push(food);
      this.saveFoods(food.userId, foods);
      return food;
    }
  }

  async deleteFood(id: string, userId: string): Promise<void> {
    const foods = await this.getFoods(userId);
    const filtered = foods.filter((f) => !(f.id === id && f.userId === userId));
    this.saveFoods(userId, filtered);
  }

  getStats(userId: string): UserStats {
    if (typeof window === "undefined") return { rescued: 0, wasted: 0 };
    try {
      const raw = localStorage.getItem(this.statsKey(userId));
      if (!raw) return { rescued: 0, wasted: 0 };
      return JSON.parse(raw) as UserStats;
    } catch {
      return { rescued: 0, wasted: 0 };
    }
  }

  updateStats(userId: string, stats: UserStats): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.statsKey(userId), JSON.stringify(stats));
  }
}

export const localFoodRepo = new LocalFoodRepository();
