"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { FoodItem, UserStats } from "@/types";
import { foodRepo } from "@/lib/storage";
import { LocalFoodRepository } from "@/lib/storage/localFoodRepository";
import { useAuth } from "./AuthProvider";
import { DEMO_EMAIL } from "@/config/demo";
import { demoPhotos } from "@/data/demoPhotos";

interface FoodsContextType {
  foods: FoodItem[];
  stats: UserStats;
  isLoading: boolean;
  addFood: (food: Omit<FoodItem, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateFood: (food: FoodItem) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  markConsumed: (id: string) => Promise<void>;
  markWasted: (id: string) => Promise<void>;
  loadDemoFoods: () => Promise<void>;
  refresh: () => Promise<void>;
}

const FoodsContext = createContext<FoodsContextType | undefined>(undefined);

const localRepo = foodRepo as LocalFoodRepository;

function buildDemoFoods(): Array<Omit<FoodItem, "id" | "userId" | "createdAt" | "updatedAt">> {
  const today = new Date();
  const addDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  return [
    { name: "Leche", quantity: 1, unit: "l", category: "lacteos", expiresAt: addDays(7), photoUrl: demoPhotos.leche },
    { name: "Huevos", quantity: 12, unit: "unidades", category: "despensa", expiresAt: addDays(14) },
    { name: "Tomate", quantity: 6, unit: "unidades", category: "verduras", expiresAt: addDays(1) },
    { name: "Pollo", quantity: 500, unit: "g", category: "carnes", expiresAt: addDays(0) },
    { name: "Banano maduro", quantity: 6, unit: "unidades", category: "frutas", expiresAt: addDays(-1) },
    { name: "Arroz", quantity: 1, unit: "kg", category: "granos", expiresAt: addDays(60) },
    { name: "Queso", quantity: 250, unit: "g", category: "lacteos", expiresAt: addDays(4) },
    { name: "Cebolla", quantity: 1, unit: "kg", category: "verduras", expiresAt: addDays(10) },
    { name: "Aguacate", quantity: 2, unit: "unidades", category: "frutas", expiresAt: addDays(2), photoUrl: demoPhotos.aguacate },
    { name: "Yogurt", quantity: 4, unit: "unidades", category: "lacteos", expiresAt: addDays(3) },
    { name: "Pan", quantity: 1, unit: "paquetes", category: "panaderia", expiresAt: addDays(5) },
    { name: "Manzanas", quantity: 5, unit: "unidades", category: "frutas", expiresAt: addDays(6), photoUrl: demoPhotos.manzanas },
    { name: "Zanahoria", quantity: 1, unit: "kg", category: "verduras", expiresAt: addDays(-2), notes: "Revisar antes de usar" },
  ];
}

async function seedDemoFoods(userId: string): Promise<void> {
  const now = new Date().toISOString();
  for (const item of buildDemoFoods()) {
    await foodRepo.addFood({
      ...item,
      id: crypto.randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
      notes: item.notes || "",
    });
  }
}

export function FoodsProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [stats, setStats] = useState<UserStats>({ rescued: 0, wasted: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setFoods([]);
        setStats({ rescued: 0, wasted: 0 });
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        let f = await foodRepo.getFoods(user.id);
        if (f.length === 0 && user.email === DEMO_EMAIL) {
          await seedDemoFoods(user.id);
          if (localRepo.updateStats) {
            localRepo.updateStats(user.id, { rescued: 6, wasted: 1 });
          }
          f = await foodRepo.getFoods(user.id);
        }
        setFoods(f);
        if (localRepo.getStats) {
          setStats(localRepo.getStats(user.id));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id, user?.email]);

  const loadFoods = async () => {
    if (!user?.id) {
      setFoods([]);
      setStats({ rescued: 0, wasted: 0 });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const f = await foodRepo.getFoods(user.id);
      setFoods(f);
      if (localRepo.getStats) {
        setStats(localRepo.getStats(user.id));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const addFood = async (
    food: Omit<FoodItem, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    if (!user?.id) return;
    const now = new Date().toISOString();
    const newFood: FoodItem = {
      ...food,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
      notes: food.notes || "",
    };
    await foodRepo.addFood(newFood);
    await loadFoods();
  };

  const updateFood = async (food: FoodItem) => {
    if (!user?.id) return;
    await foodRepo.updateFood({ ...food, userId: user.id });
    await loadFoods();
  };

  const deleteFood = async (id: string) => {
    if (!user?.id) return;
    await foodRepo.deleteFood(id, user.id);
    await loadFoods();
  };

  const markConsumed = async (id: string) => {
    if (!user?.id) return;
    // update stats
    const current = localRepo.getStats ? localRepo.getStats(user.id) : { rescued: 0, wasted: 0 };
    const newStats = { ...current, rescued: (current.rescued || 0) + 1 };
    if (localRepo.updateStats) localRepo.updateStats(user.id, newStats);
    setStats(newStats);
    await deleteFood(id);
  };

  const markWasted = async (id: string) => {
    if (!user?.id) return;
    const current = localRepo.getStats ? localRepo.getStats(user.id) : { rescued: 0, wasted: 0 };
    const newStats = { ...current, wasted: (current.wasted || 0) + 1 };
    if (localRepo.updateStats) localRepo.updateStats(user.id, newStats);
    setStats(newStats);
    await deleteFood(id);
  };

  const loadDemoFoods = async () => {
    if (!user?.id) return;
    for (const item of buildDemoFoods()) {
      await addFood(item);
    }
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
        refresh: loadFoods,
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
