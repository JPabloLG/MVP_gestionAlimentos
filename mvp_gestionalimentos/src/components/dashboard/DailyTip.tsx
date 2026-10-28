"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { getTipForToday } from "@/data/tips";
import { Lightbulb } from "lucide-react";

export function DailyTip() {
  const tip = getTipForToday();
  return (
    <Card className="bg-accent-soft border-accent/30">
      <div className="flex items-start gap-3">
        <Lightbulb className="text-accent flex-shrink-0" size={24} />
        <div>
          <h3 className="font-semibold mb-1">Consejo del día</h3>
          <p className="text-sm">{tip}</p>
        </div>
      </div>
    </Card>
  );
}
