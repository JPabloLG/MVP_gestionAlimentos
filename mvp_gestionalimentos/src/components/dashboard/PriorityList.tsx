"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useFoods } from "@/hooks/useFoods";
import { getDaysRemaining, getExpiryStatus, sortByPriority } from "@/lib/expiry";
import { ExpiryBadge } from "@/components/inventory/ExpiryBadge";
import { statusMeta, statusOrder } from "@/components/inventory/statusMeta";
import { categoryMeta } from "@/data/categories";
import { ArrowRight, Refrigerator } from "lucide-react";
import { ExpiryStatus } from "@/types";

/**
 * "Tu nevera hoy": traffic light distribution as one segmented bar (Gestalt:
 * continuity) followed by the five most urgent foods (RF-08).
 */
export function PriorityList() {
  const { foods } = useFoods();
  const sorted = useMemo(() => sortByPriority(foods).slice(0, 5), [foods]);
  const counts = useMemo(() => {
    const c: Record<ExpiryStatus, number> = { expired: 0, critical: 0, soon: 0, fresh: 0 };
    for (const f of foods) c[getExpiryStatus(getDaysRemaining(f.expiresAt))]++;
    return c;
  }, [foods]);

  return (
    <Card animate={false} className="h-full">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Refrigerator size={20} className="text-primary" aria-hidden="true" />
          Tu nevera hoy
        </h2>
        {foods.length > 0 && (
          <Link href="/inventario" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1 min-h-[44px]">
            Ver todo <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>

      {foods.length === 0 ? (
        <div className="text-center py-4">
          <Image src="/illustrations/empty.svg" alt="" width={160} height={124} className="mx-auto mb-3 w-36 h-auto" />
          <p className="text-ink-muted text-sm mb-3">Aún no hay alimentos registrados.</p>
          <Link href="/inventario" className="text-primary font-medium hover:underline">
            Ir al inventario para empezar
          </Link>
        </div>
      ) : (
        <>
          {/* Segmented bar: one continuous shape split by status */}
          <div className="flex h-3 rounded-full overflow-hidden bg-surface-muted mb-2" role="img" aria-label={statusOrder.map((s) => `${counts[s]} ${statusMeta[s].label}`).join(", ")}>
            {statusOrder.map((s) =>
              counts[s] > 0 ? (
                <div key={s} className={statusMeta[s].solid} style={{ width: `${(counts[s] / foods.length) * 100}%` }} />
              ) : null
            )}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-5 text-xs">
            {statusOrder.map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${statusMeta[s].solid}`} aria-hidden="true" />
                <span className="text-ink-muted">{statusMeta[s].label}</span>
                <span className="font-semibold">{counts[s]}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-sm font-semibold text-ink-muted mb-2">Úsalos primero</h3>
          <ul className="space-y-2">
            {sorted.map((food) => {
              const meta = statusMeta[getExpiryStatus(getDaysRemaining(food.expiresAt))];
              return (
                <li
                  key={food.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border-l-4 ${meta.border} ${meta.soft} px-3 py-2`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-surface flex items-center justify-center text-lg" aria-hidden="true">
                      {categoryMeta[food.category].emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{food.name}</p>
                      <p className="text-xs text-ink-muted">
                        {food.quantity} {food.unit}
                      </p>
                    </div>
                  </div>
                  <ExpiryBadge expiresAt={food.expiresAt} className="bg-surface!" />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
