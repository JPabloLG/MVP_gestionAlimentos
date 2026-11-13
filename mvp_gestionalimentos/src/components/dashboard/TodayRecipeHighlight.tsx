"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRecipes } from "@/hooks/useRecipes";
import { buttonClasses } from "@/components/ui/Button";
import { Clock, Users, Flame } from "lucide-react";
import { getExpiryLabel } from "@/lib/expiry";
import { statusMeta } from "@/components/inventory/statusMeta";

/** Featured recipe of the day: always a rescue recipe when there is one (RN-06). */
export function TodayRecipeHighlight() {
  const { recommendations } = useRecipes();
  const best = recommendations.find((r) => r.section === "rescue") || recommendations[0];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-soft via-surface to-surface p-5 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={20} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Hoy cocina con…</h2>
      </div>

      {!best ? (
        <div className="text-center">
          <Image src="/illustrations/cooking.svg" alt="" width={240} height={180} className="mx-auto w-40 h-auto mb-2" />
          <p className="text-ink-muted text-sm mb-3">Agrega alimentos para recibir una receta del día.</p>
          <Link href="/inventario" className={buttonClasses("secondary", "md")}>
            Ir al inventario
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 mb-4">
            <span className="w-16 h-16 shrink-0 rounded-2xl bg-surface shadow-sm flex items-center justify-center text-4xl" aria-hidden="true">
              {best.emoji}
            </span>
            <div className="min-w-0">
              <h3 className="text-xl font-semibold leading-tight mb-1">{best.title}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1">
                  <Clock size={15} aria-hidden="true" />
                  {best.timeMinutes} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={15} aria-hidden="true" />
                  {best.servings} porciones
                </span>
              </div>
            </div>
          </div>
          <p className="text-ink-muted text-sm mb-3">{best.description}</p>
          {best.usedFoods.length > 0 && (
            <>
              <p className="text-xs font-semibold text-ink-muted mb-2">Aprovecha</p>
              <ul className="flex flex-wrap gap-2 mb-4">
                {[...best.usedFoods]
                  .sort((a, b) => a.daysRemaining - b.daysRemaining)
                  .map((uf) => {
                    const meta = statusMeta[uf.urgency];
                    return (
                      <li key={uf.foodId} className={`rounded-full px-3 py-1 text-xs font-medium ${meta.soft} ${meta.text}`}>
                        {uf.foodName} · {getExpiryLabel(uf.daysRemaining).toLowerCase()}
                      </li>
                    );
                  })}
              </ul>
            </>
          )}
          <Link href={`/recetas/${best.id}`} className={buttonClasses("primary", "md", "w-full")}>
            Ver receta completa
          </Link>
        </>
      )}
    </section>
  );
}
