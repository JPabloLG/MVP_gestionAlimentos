"use client";

import React, { useState } from "react";
import { categoryMeta } from "@/data/categories";
import { getFoodImageUrl } from "@/data/foodImages";
import { FoodItem } from "@/types";

interface FoodImageProps {
  food: Pick<FoodItem, "id" | "name" | "category" | "photoUrl">;
}

export function FoodImage({ food }: FoodImageProps) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = food.photoUrl || getFoodImageUrl(food);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={`${food.name}, imagen no disponible`}
        className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100"
      >
        <span className="text-6xl drop-shadow-sm">{categoryMeta[food.category].emoji}</span>
      </div>
    );
  }

  return (
    <div className="h-32 w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${food.id}:${imageUrl}`}
        src={imageUrl}
        alt={food.name}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
      />
    </div>
  );
}
