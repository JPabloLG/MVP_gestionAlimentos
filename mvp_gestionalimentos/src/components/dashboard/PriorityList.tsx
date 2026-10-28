"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useFoods } from "@/hooks/useFoods";
import { sortByPriority } from "@/lib/expiry";
import { ExpiryBadge } from "@/components/inventory/ExpiryBadge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { categoryMeta } from "@/data/categories";

export function PriorityList() {
  const { foods } = useFoods();
  const sorted = sortByPriority(foods).slice(0, 5);

  if (sorted.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-semibold mb-2">Alimentos prioritarios</h2>
        <p className="text-ink-muted text-sm">No hay alimentos registrados aún.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Alimentos prioritarios</h2>
        <Link href="/inventario" className="text-sm text-primary hover:underline">
          Ver todo
        </Link>
      </div>
      <div className="space-y-3">
        {sorted.map((food) => (
          <div key={food.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span>{categoryMeta[food.category].emoji}</span>
              <div className="min-w-0">
                <p className="font-medium truncate">{food.name}</p>
                <p className="text-xs text-ink-muted">
                  {food.quantity} {food.unit}
                </p>
              </div>
            </div>
            <ExpiryBadge expiresAt={food.expiresAt} />
          </div>
        ))}
      </div>
    </Card>
  );
}
