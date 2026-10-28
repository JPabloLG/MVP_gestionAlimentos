"use client";

import React from "react";
import { useFoods } from "@/hooks/useFoods";
import { getDaysRemaining, getExpiryStatus } from "@/lib/expiry";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function ExpiringAlert() {
  const { foods } = useFoods();
  const expired = foods.filter((f) => getExpiryStatus(getDaysRemaining(f.expiresAt)) === "expired");
  const critical = foods.filter((f) => getExpiryStatus(getDaysRemaining(f.expiresAt)) === "critical");

  if (expired.length === 0 && critical.length === 0) return null;

  return (
    <Card className="border-critical/30 bg-critical-soft">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-critical flex-shrink-0" size={24} />
        <div>
          <h3 className="font-semibold mb-1">¡Atención!</h3>
          <p className="text-sm">
            {expired.length > 0 && `Tienes ${expired.length} alimento(s) vencido(s). `}
            {critical.length > 0 && `Tienes ${critical.length} alimento(s) que vencen hoy o en 2 días.`}{" "}
            Revisa tu inventario para aprovecharlos.
          </p>
        </div>
      </div>
    </Card>
  );
}
