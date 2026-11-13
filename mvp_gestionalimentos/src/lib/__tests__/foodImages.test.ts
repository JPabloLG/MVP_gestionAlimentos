import { describe, expect, it } from "vitest";
import { getFoodImageUrl } from "@/data/foodImages";

describe("getFoodImageUrl", () => {
  it("uses a product-specific image when the food name is recognized", () => {
    expect(getFoodImageUrl({ name: "Aguacate maduro", category: "frutas" })).toContain(
      "photo-1523049673857-eb18f1d7b578"
    );
  });

  it("uses a category image for unrecognized foods", () => {
    expect(getFoodImageUrl({ name: "Producto nuevo", category: "lacteos" })).toContain(
      "photo-1550583724-b2692b85b150"
    );
  });
});
