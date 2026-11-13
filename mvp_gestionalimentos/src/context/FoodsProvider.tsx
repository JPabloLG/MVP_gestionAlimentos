"use client";

/**
 * Inventory state for the signed-in user (RF-03 to RF-06, RN-01, RN-02).
 *
 * The owner of every operation is the session user, never a value coming from
 * a form. Mutations resolve to `true`/`false` instead of throwing: a failed
 * write (storage full or blocked) is reported here with a toast, so no caller
 * can forget to handle it.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FoodItem, NewFood, UserStats } from "@/types";
import { buildDemoFoods, missingDemoFoods } from "@/lib/foods";
import { DEMO_EMAIL } from "@/config/demo";
import { localFoodRepo } from "@/lib/storage";
import { onStorageIssue } from "@/lib/storage/safeStorage";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";

export type { NewFood };

/** Stamps a new food with its id, timestamps and owner. The owner is always the session user (RN-01). */
function toFoodItem(food: NewFood, ownerId: string): FoodItem {
  const now = new Date().toISOString();
  return { ...food, id: crypto.randomUUID(), userId: ownerId, createdAt: now, updatedAt: now, notes: food.notes || "" };
}

interface FoodsContextType {
  foods: FoodItem[];
  stats: UserStats;
  isLoading: boolean;
  addFood: (food: NewFood) => Promise<boolean>;
  updateFood: (food: FoodItem) => Promise<boolean>;
  deleteFood: (id: string) => Promise<boolean>;
  markConsumed: (id: string) => Promise<boolean>;
  markWasted: (id: string) => Promise<boolean>;
  /** Removes several foods at once, counting each as rescued or wasted exactly once. */
  settleFoods: (ids: string[], outcome: keyof UserStats) => Promise<boolean>;
  loadDemoFoods: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const FoodsContext = createContext<FoodsContextType | undefined>(undefined);

const EMPTY_STATS: UserStats = { rescued: 0, wasted: 0 };

export function FoodsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id;
  const isDemoUser = user?.email === DEMO_EMAIL;
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    // Without a user nothing may stay in memory: the next account must start clean (RN-02).
    let nextFoods = await (userId ? localFoodRepo.getFoods(userId) : Promise.resolve([]));
    // The demo account (login page / landing) starts with a ready-made inventory and history.
    if (userId && isDemoUser && nextFoods.length === 0) {
      try {
        await localFoodRepo.addFoods(buildDemoFoods().map((food) => toFoodItem(food, userId)));
        localFoodRepo.updateStats(userId, { rescued: 6, wasted: 1 });
        nextFoods = await localFoodRepo.getFoods(userId);
      } catch {
        // Storage full or blocked: the demo simply starts empty.
      }
    }
    setFoods(nextFoods);
    setStats(userId ? localFoodRepo.getStats(userId) : EMPTY_STATS);
    setIsLoading(false);
  }, [userId, isDemoUser]);

  useEffect(() => {
    // State is only set after the (async) storage read resolves.
    const load = async () => {
      await reload();
    };
    load();
  }, [reload]);

  useEffect(
    () =>
      onStorageIssue(() =>
        showToast(
          "Algunos datos guardados estaban dañados. Guardamos una copia de respaldo en este navegador.",
          "error"
        )
      ),
    [showToast]
  );

  /** Runs a write for the current user, reloads, and turns any failure into a toast. */
  const mutate = async (action: (ownerId: string) => Promise<unknown> | unknown): Promise<boolean> => {
    if (!userId) return false;
    try {
      await action(userId);
      return true;
    } catch (e) {
      showToast(e instanceof Error && e.message ? e.message : "No se pudo guardar", "error");
      return false;
    } finally {
      await reload();
    }
  };

  const addFood = (food: NewFood) => mutate((ownerId) => localFoodRepo.addFood(toFoodItem(food, ownerId)));

  const updateFood = (food: FoodItem) =>
    mutate((ownerId) => localFoodRepo.updateFood({ ...food, userId: ownerId }));

  const deleteFood = (id: string) => mutate((ownerId) => localFoodRepo.deleteFood(id, ownerId));

  const settleFoods = (ids: string[], outcome: keyof UserStats) =>
    mutate((ownerId) => localFoodRepo.settleFoods(ownerId, ids, outcome));

  const markConsumed = (id: string) => settleFoods([id], "rescued");

  const markWasted = (id: string) => settleFoods([id], "wasted");

  const loadDemoFoods = () =>
    mutate(async (ownerId) => {
      // Read fresh from storage so two quick taps cannot both see an empty inventory.
      const current = await localFoodRepo.getFoods(ownerId);
      await localFoodRepo.addFoods(missingDemoFoods(current).map((food) => toFoodItem(food, ownerId)));
    });

  return (
    <FoodsContext.Provider
      value={{
        foods,
        stats,
        isLoading,
        addFood,
        updateFood,
        deleteFood,
        markConsumed,
        markWasted,
        settleFoods,
        loadDemoFoods,
        refresh: reload,
      }}
    >
      {children}
    </FoodsContext.Provider>
  );
}

export function useFoods() {
  const ctx = useContext(FoodsContext);
  if (!ctx) throw new Error("useFoods must be used within FoodsProvider");
  return ctx;
}
