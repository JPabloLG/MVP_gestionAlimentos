"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useFoods } from "@/hooks/useFoods";
import { calculateStats } from "@/lib/stats";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Package, AlertTriangle, XCircle, Heart } from "lucide-react";

export function StatsSummary() {
  const { foods, stats } = useFoods();
  const summary = calculateStats(foods, stats);

  const items = [
    { label: "Total", value: summary.total, icon: Package, color: "text-ink" },
    { label: "Por vencer", value: summary.critical + summary.soon, icon: AlertTriangle, color: "text-soon" },
    { label: "Vencidos", value: summary.expired, icon: XCircle, color: "text-expired" },
    { label: "Rescatados", value: summary.rescued, icon: Heart, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={18} className={item.color} />
              <span className="text-sm text-ink-muted">{item.label}</span>
            </div>
            <p className="text-2xl font-semibold">
              <AnimatedNumber value={item.value} />
            </p>
          </Card>
        );
      })}
    </div>
  );
}
