import { AuthRepository } from "./authRepository";
import { FoodRepository } from "./foodRepository";
import { LocalAuthRepository } from "./localAuthRepository";
import { LocalFoodRepository } from "./localFoodRepository";

export const authRepo: AuthRepository = new LocalAuthRepository();
export const foodRepo: FoodRepository = new LocalFoodRepository();
export { LocalAuthRepository } from "./localAuthRepository";
export { LocalFoodRepository } from "./localFoodRepository";
export type { AuthRepository } from "./authRepository";
export type { FoodRepository } from "./foodRepository";
