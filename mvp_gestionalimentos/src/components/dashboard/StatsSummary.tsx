"use client";

import React, { useMemo } from "react";
import { useFoods } from "@/hooks/useFoods";
import { calculateStats } from "@/lib/stats";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Package, Clock, XCircle, Heart, type LucideIcon } from "lucide-react";

interface Tile {
  label: string;
  caption: string;
  value: number;
  icon: LucideIcon;
  iconBox: string;
}

/** Four key numbers, each in its own tinted tile (Gestalt: common region + similarity). */
export function StatsSummary() {
  const { foods, stats } = useFoods();
  const summary = useMemo(() => calculateStats(foods, stats), [foods, stats]);

  const tiles: Tile[] = [
    { label: "En tu nevera", caption: "alimentos", value: summary.total, icon: Package, iconBox: "bg-primary-soft text-primary" },
    { label: "Por vencer", caption: "en 5 días o menos", value: summary.critical + summary.soon, icon: Clock, iconBox: "bg-soon-soft text-soon-ink" },
    { label: "Vencidos", caption: "revísalos", value: summary.expired, icon: XCircle, iconBox: "bg-expired-soft text-expired" },
    { label: "Rescatados", caption: "consumidos a tiempo", value: summary.rescued, icon: Heart, iconBox: "bg-fresh-soft text-fresh-ink" },
  ];

  return (
    <section aria-label="Resumen" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.label} className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex flex-col items-start min-[400px]:flex-row min-[400px]:items-center gap-3 min-w-0">
            <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${tile.iconBox}`}>
              <Icon size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none mb-1">
                <AnimatedNumber value={tile.value} />
              </p>
              <p className="text-sm font-medium leading-tight truncate">{tile.label}</p>
              <p className="text-xs text-ink-muted leading-tight truncate">{tile.caption}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
