import { describe, expect, it } from "vitest";
import { FoodItem } from "@/types";
import { groupIdenticalFoods } from "@/lib/inventory";

const makeFood = (overrides: Partial<FoodItem> = {}): FoodItem => ({
  id: crypto.randomUUID(),
  userId: "user-1",
  name: "Papaya",
  quantity: 1,
  unit: "unidades",
  category: "frutas",
  expiresAt: "2026-11-20",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("groupIdenticalFoods", () => {
  it("groups identical products and keeps their individual records", () => {
    const foods = [makeFood(), makeFood(), makeFood()];

    const groups = groupIdenticalFoods(foods);

    expect(groups).toHaveLength(1);
    expect(groups[0].foods).toEqual(foods);
  });

  it("keeps products in separate groups when any grouping field differs", () => {
    const foods = [
      makeFood(),
      makeFood({ name: "papaya" }),
      makeFood({ category: "otros" }),
      makeFood({ unit: "kg" }),
      makeFood({ quantity: 2 }),
      makeFood({ expiresAt: "2026-11-21" }),
    ];

    expect(groupIdenticalFoods(foods)).toHaveLength(6);
  });
});
