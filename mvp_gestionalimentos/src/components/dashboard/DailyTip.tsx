"use client";

import React from "react";
import { getTipForToday } from "@/data/tips";
import { Lightbulb } from "lucide-react";

export function DailyTip() {
  const tip = getTipForToday();
  return (
    <section className="relative overflow-hidden rounded-2xl bg-accent-soft border border-accent/30 p-5">
      <div className="absolute -right-6 -bottom-8 text-8xl opacity-20 select-none" aria-hidden="true">
        🥕
      </div>
      <div className="relative flex items-start gap-3">
        <span className="w-10 h-10 shrink-0 rounded-full bg-surface flex items-center justify-center">
          <Lightbulb className="text-accent" size={22} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold mb-1">Consejo del día</h2>
          <p className="text-sm">{tip}</p>
        </div>
      </div>
    </section>
  );
}
