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
import { FoodItem, UserStats } from "@/types";
import { localFoodRepo } from "@/lib/storage";
import { onStorageIssue } from "@/lib/storage/safeStorage";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";

export type NewFood = Omit<FoodItem, "id" | "userId" | "createdAt" | "updatedAt">;

interface FoodsContextType {
  foods: FoodItem[];
  stats: UserStats;
  isLoading: boolean;
  addFood: (food: NewFood) => Promise<boolean>;
  updateFood: (food: FoodItem) => Promise<boolean>;
  deleteFood: (id: string) => Promise<boolean>;
  markConsumed: (id: string) => Promise<boolean>;
  markWasted: (id: string) => Promise<boolean>;
  loadDemoFoods: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const FoodsContext = createContext<FoodsContextType | undefined>(undefined);

const EMPTY_STATS: UserStats = { rescued: 0, wasted: 0 };

export function FoodsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id;
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    // Without a user nothing may stay in memory: the next account must start clean (RN-02).
    const nextFoods = await (userId ? localFoodRepo.getFoods(userId) : Promise.resolve([]));
    setFoods(nextFoods);
    setStats(userId ? localFoodRepo.getStats(userId) : EMPTY_STATS);
    setIsLoading(false);
  }, [userId]);

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

  const addFood = (food: NewFood) =>
    mutate((ownerId) => {
      const now = new Date().toISOString();
      return localFoodRepo.addFood({
        ...food,
        id: crypto.randomUUID(),
        userId: ownerId,
        createdAt: now,
        updatedAt: now,
        notes: food.notes || "",
      });
    });

  const updateFood = (food: FoodItem) =>
    mutate((ownerId) => localFoodRepo.updateFood({ ...food, userId: ownerId }));

  const deleteFood = (id: string) => mutate((ownerId) => localFoodRepo.deleteFood(id, ownerId));

  const markConsumed = (id: string) =>
    mutate(async (ownerId) => {
      const current = localFoodRepo.getStats(ownerId);
      localFoodRepo.updateStats(ownerId, { ...current, rescued: current.rescued + 1 });
      await localFoodRepo.deleteFood(id, ownerId);
    });

  const markWasted = (id: string) =>
    mutate(async (ownerId) => {
      const current = localFoodRepo.getStats(ownerId);
      localFoodRepo.updateStats(ownerId, { ...current, wasted: current.wasted + 1 });
      await localFoodRepo.deleteFood(id, ownerId);
    });

  const loadDemoFoods = async () => {
    if (!user?.id) return false;
    const today = new Date();
    const addDays = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    const demo: NewFood[] = [
      { name: "Leche", quantity: 1, unit: "l", category: "lacteos", expiresAt: addDays(7) },
      { name: "Huevos", quantity: 12, unit: "unidades", category: "despensa", expiresAt: addDays(14) },
      { name: "Tomate", quantity: 6, unit: "unidades", category: "verduras", expiresAt: addDays(1) },
      { name: "Pollo", quantity: 500, unit: "g", category: "carnes", expiresAt: addDays(0) },
      { name: "Banano maduro", quantity: 6, unit: "unidades", category: "frutas", expiresAt: addDays(-1) },
      { name: "Arroz", quantity: 1, unit: "kg", category: "granos", expiresAt: addDays(60) },
      { name: "Queso", quantity: 250, unit: "g", category: "lacteos", expiresAt: addDays(4) },
      { name: "Cebolla", quantity: 1, unit: "kg", category: "verduras", expiresAt: addDays(10) },
      { name: "Aguacate", quantity: 2, unit: "unidades", category: "frutas", expiresAt: addDays(2) },
      { name: "Yogurt", quantity: 4, unit: "unidades", category: "lacteos", expiresAt: addDays(3) },
      { name: "Pan", quantity: 1, unit: "paquetes", category: "panaderia", expiresAt: addDays(5) },
    ];
    for (const d of demo) {
      if (!(await addFood(d))) return false;
    }
    return true;
  };

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
