"use client";

import React, { useState } from "react";
import { ChefHat } from "lucide-react";
import { recipeImages } from "@/data/recipeImages";

interface RecipeImageProps {
  recipeId: string;
  title: string;
  emoji: string;
  className: string;
  priority?: boolean;
}

export function RecipeImage({
  recipeId,
  title,
  emoji,
  className,
  priority = false,
}: RecipeImageProps) {
  const [hasError, setHasError] = useState(false);
  const src = recipeImages[recipeId];

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={`Ilustración para ${title}`}
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 ${className}`}
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/40 blur-xl" />
        <span className="relative text-7xl drop-shadow-sm">{emoji}</span>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-emerald-800 shadow-sm">
          <ChefHat size={17} />
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
}
