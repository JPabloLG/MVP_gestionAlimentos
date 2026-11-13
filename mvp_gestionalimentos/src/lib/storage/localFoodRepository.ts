/**
 * `localStorage` implementation of the food repository (RN-01, RN-02, RNF-05).
 *
 * Each user owns the keys `gestionalo:foods:<userId>` and
 * `gestionalo:stats:<userId>`. Every operation receives the owner id and only
 * touches that user's keys, so one account can never read or change another's.
 */
import { FoodRepository } from "./foodRepository";
import { FoodItem, UserStats } from "@/types";
import { readJson, readJsonList, writeJson } from "./safeStorage";
import { storedFoodSchema, storedStatsSchema } from "./schemas";

const FOODS_KEY_PREFIX = "gestionalo:foods:";
const STATS_KEY_PREFIX = "gestionalo:stats:";

export class LocalFoodRepository implements FoodRepository {
  private foodsKey(userId: string) {
    return `${FOODS_KEY_PREFIX}${userId}`;
  }

  private statsKey(userId: string) {
    return `${STATS_KEY_PREFIX}${userId}`;
  }

  // Synchronous on purpose: read-modify-write sequences below must not interleave.
  private readFoods(userId: string): FoodItem[] {
    return readJsonList(this.foodsKey(userId), storedFoodSchema).filter((f) => f.userId === userId);
  }

  private saveFoods(userId: string, foods: FoodItem[]): void {
    writeJson(this.foodsKey(userId), foods);
  }

  async getFoods(userId: string): Promise<FoodItem[]> {
    return this.readFoods(userId);
  }

  async addFood(food: FoodItem): Promise<FoodItem> {
    this.saveFoods(food.userId, [...this.readFoods(food.userId), food]);
    return food;
  }

  async updateFood(food: FoodItem): Promise<FoodItem> {
    const foods = this.readFoods(food.userId);
    const idx = foods.findIndex((f) => f.id === food.id && f.userId === food.userId);
    // No upsert: updating a food that is not in this user's inventory must not create it (RN-02).
    if (idx < 0) throw new Error("El alimento ya no existe en tu inventario.");
    foods[idx] = { ...food, updatedAt: new Date().toISOString() };
    this.saveFoods(food.userId, foods);
    return foods[idx];
  }

  async deleteFood(id: string, userId: string): Promise<void> {
    const foods = this.readFoods(userId);
    this.saveFoods(
      userId,
      foods.filter((f) => f.id !== id)
    );
  }

  getStats(userId: string): UserStats {
    return readJson(this.statsKey(userId), storedStatsSchema, { rescued: 0, wasted: 0 });
  }

  updateStats(userId: string, stats: UserStats): void {
    writeJson(this.statsKey(userId), stats);
  }
}
