"use client";

import React from "react";
import Link from "next/link";
import { Clock, Users, Sparkles } from "lucide-react";
import { RecommendedRecipe } from "@/lib/recipes";
import { getExpiryLabel } from "@/lib/expiry";
import { statusMeta } from "@/components/inventory/statusMeta";

const difficultyLabel = { facil: "Fácil", media: "Media" } as const;

/**
 * Recipe card used on the dashboard and on /recetas.
 * Says WHY it is recommended: the most urgent food it rescues (RN-06).
 */
export function RecipeCard({ recipe, compact = false }: { recipe: RecommendedRecipe; compact?: boolean }) {
  // usedFoods are picked most-urgent-first by the engine
  const urgent = [...recipe.usedFoods].sort((a, b) => a.daysRemaining - b.daysRemaining)[0];
  const rescues = urgent && (urgent.urgency === "critical" || urgent.urgency === "soon");
  const coverage = Math.round(recipe.coverage * 100);

  return (
    <Link
      href={`/recetas/${recipe.id}`}
      className="group flex flex-col h-full bg-surface rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className={`relative flex items-center justify-center ${compact ? "h-20" : "h-28"} bg-gradient-to-br from-accent-soft to-primary-soft`}>
        <span className={compact ? "text-4xl" : "text-5xl"} aria-hidden="true">
          {recipe.emoji}
        </span>
        {rescues && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-0.5 text-xs font-semibold text-critical-ink">
            <Sparkles size={12} aria-hidden="true" />
            Rescate
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold leading-snug group-hover:text-primary">{recipe.title}</h3>
        {!compact && <p className="text-sm text-ink-muted line-clamp-2">{recipe.description}</p>}

        {rescues && (
          <p className={`text-xs font-medium rounded-lg px-2 py-1 ${statusMeta[urgent.urgency].soft} ${statusMeta[urgent.urgency].text}`}>
            Usa tu {urgent.foodName.toLowerCase()}, {getExpiryLabel(urgent.daysRemaining).toLowerCase()}
          </p>
        )}

        <div className="mt-auto pt-2 space-y-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Clock size={13} aria-hidden="true" />
              {recipe.timeMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={13} aria-hidden="true" />
              {recipe.servings} porc.
            </span>
            <span>{difficultyLabel[recipe.difficulty]}</span>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ink-muted">Tienes los ingredientes</span>
              <span className="font-semibold">{coverage}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${coverage}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
