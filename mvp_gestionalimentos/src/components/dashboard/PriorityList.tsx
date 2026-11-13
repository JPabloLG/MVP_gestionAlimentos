"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useFoods } from "@/hooks/useFoods";
import { sortByPriority } from "@/lib/expiry";
import { ExpiryBadge } from "@/components/inventory/ExpiryBadge";
import Link from "next/link";
import { categoryMeta } from "@/data/categories";
import { ArrowRight, PackageOpen } from "lucide-react";

export function PriorityList() {
  const { foods } = useFoods();
  const sorted = sortByPriority(foods).slice(0, 5);

  if (sorted.length === 0) {
    return (
      <Card className="flex h-full flex-col justify-between bg-[#F0F5EF] p-6">
        <div>
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary"><PackageOpen size={20} /></span>
          <h2 className="mb-2 text-lg font-semibold">Tu lista empieza aquí</h2>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">Agrega alimentos y te avisaremos cuáles conviene usar primero.</p>
        </div>
        <Link href="/inventario" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3">
          Abrir inventario <ArrowRight size={16} />
        </Link>
      </Card>
    );
  }

  return (
    <Card className="h-full p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Ojo con estos</p><h2 className="mt-1 text-lg font-semibold">Alimentos prioritarios</h2></div>
        <Link href="/inventario" className="text-sm text-primary hover:underline">
          Ver todo
        </Link>
      </div>
      <div className="space-y-3">
        {sorted.map((food) => (
          <div key={food.id} className="flex items-center justify-between gap-3 rounded-2xl bg-background px-3 py-3">
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
