"use client";

import React from "react";
import Link from "next/link";
import { useFoods } from "@/hooks/useFoods";
import { getDaysRemaining, getExpiryStatus } from "@/lib/expiry";
import { AlertTriangle, ArrowRight } from "lucide-react";

/** Attention banner: only shows when something is expired or about to expire. */
export function ExpiringAlert() {
  const { foods } = useFoods();
  const statuses = foods.map((f) => getExpiryStatus(getDaysRemaining(f.expiresAt)));
  const expired = statuses.filter((s) => s === "expired").length;
  const critical = statuses.filter((s) => s === "critical").length;

  if (expired === 0 && critical === 0) return null;

  return (
    <div role="status" className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-critical/40 bg-critical-soft p-4">
      <span className="w-10 h-10 shrink-0 rounded-full bg-surface flex items-center justify-center">
        <AlertTriangle className="text-critical-ink" size={22} aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-critical-ink">¡Atención!</p>
        <p className="text-sm">
          {critical > 0 && `${critical} ${critical === 1 ? "alimento vence" : "alimentos vencen"} hoy o en los próximos 2 días. `}
          {expired > 0 && `${expired} ${expired === 1 ? "alimento ya venció" : "alimentos ya vencieron"}: revísalos antes de consumir.`}
        </p>
      </div>
      <Link
        href="/inventario"
        className="inline-flex items-center gap-1 text-sm font-semibold text-critical-ink hover:underline min-h-[44px] shrink-0"
      >
        Revisar <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
