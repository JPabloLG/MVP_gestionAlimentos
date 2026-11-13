"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useFoods } from "@/hooks/useFoods";
import { calculateStats } from "@/lib/stats";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Package, AlertTriangle, XCircle, Heart, ArrowUpRight } from "lucide-react";

export function StatsSummary() {
  const { foods, stats } = useFoods();
  const summary = calculateStats(foods, stats);

  const items = [
    { label: "En tu cocina", value: summary.total, icon: Package, color: "text-primary", bg: "bg-primary-soft" },
    { label: "Por usar pronto", value: summary.critical + summary.soon, icon: AlertTriangle, color: "text-[#A66C08]", bg: "bg-[#FFF3D6]" },
    { label: "Vencidos", value: summary.expired, icon: XCircle, color: "text-expired", bg: "bg-expired-soft" },
    { label: "Rescatados", value: summary.rescued, icon: Heart, color: "text-primary", bg: "bg-primary-soft" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="group relative overflow-hidden border-transparent bg-white p-4 transition hover:-translate-y-1 hover:border-primary/10 hover:shadow-lg hover:shadow-primary/5 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}><Icon size={19} className={item.color} /></span>
              <ArrowUpRight size={16} className="text-ink-muted/30 transition group-hover:text-primary" />
            </div>
            <p className="text-3xl font-semibold tracking-tight">
              <AnimatedNumber value={item.value} />
            </p>
            <span className="mt-1 block text-xs font-medium text-ink-muted sm:text-sm">{item.label}</span>
          </Card>
        );
      })}
    </div>
  );
}
