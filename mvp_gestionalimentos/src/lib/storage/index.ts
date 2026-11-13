/**
 * Storage entry point. The app talks to the `AuthRepository` and
 * `FoodRepository` contracts; `localFoodRepo` additionally exposes the
 * local-only extras (stats, bulk operations) that are not part of the contract.
 */
import { AuthRepository } from "./authRepository";
import { FoodRepository } from "./foodRepository";
import { LocalAuthRepository } from "./localAuthRepository";
import { LocalFoodRepository } from "./localFoodRepository";

export const localFoodRepo = new LocalFoodRepository();
export const authRepo: AuthRepository = new LocalAuthRepository();
export const foodRepo: FoodRepository = localFoodRepo;
export { LocalAuthRepository } from "./localAuthRepository";
export { LocalFoodRepository } from "./localFoodRepository";
export type { AuthRepository } from "./authRepository";
export type { FoodRepository } from "./foodRepository";
