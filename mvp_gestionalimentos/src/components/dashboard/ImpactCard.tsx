"use client";

import React from "react";
import { useFoods } from "@/hooks/useFoods";
import { Leaf } from "lucide-react";

/**
 * Share of finished foods that were eaten instead of thrown away:
 * rescued / (rescued + wasted). The measurable impact the project promises.
 */
export function ImpactCard() {
  const { stats } = useFoods();
  const total = stats.rescued + stats.wasted;
  const pct = total === 0 ? 0 : Math.round((stats.rescued / total) * 100);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <section className="bg-surface rounded-2xl border border-border shadow-sm p-5 flex items-center gap-5">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="8" className="stroke-surface-muted" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-primary transition-all duration-700"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
          {total === 0 ? "—" : `${pct}%`}
        </span>
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
          <Leaf size={18} className="text-primary" aria-hidden="true" />
          Aprovechamiento
        </h2>
        {total === 0 ? (
          <p className="text-sm text-ink-muted">
            Marca tus alimentos como <strong>consumidos</strong> o <strong>desechados</strong> y aquí verás cuánto aprovechas.
          </p>
        ) : (
          <p className="text-sm text-ink-muted">
            Rescataste <strong className="text-ink">{stats.rescued}</strong> y desechaste{" "}
            <strong className="text-ink">{stats.wasted}</strong> de {total} alimentos.
          </p>
        )}
      </div>
    </section>
  );
}
