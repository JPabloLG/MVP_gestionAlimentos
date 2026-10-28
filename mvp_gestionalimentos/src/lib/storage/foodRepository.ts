import { FoodItem } from "@/types";

export interface FoodRepository {
  getFoods(userId: string): Promise<FoodItem[]>;
  addFood(food: FoodItem): Promise<FoodItem>;
  updateFood(food: FoodItem): Promise<FoodItem>;
  deleteFood(id: string, userId: string): Promise<void>;
}
