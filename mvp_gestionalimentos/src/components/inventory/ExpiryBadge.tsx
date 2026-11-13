"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { getDaysRemaining, getExpiryStatus, getExpiryLabel } from "@/lib/expiry";

export function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
  const days = getDaysRemaining(expiresAt);
  const status = getExpiryStatus(days);
  const label = getExpiryLabel(days);
  const statusStyles = {
    expired: "border border-red-200 bg-red-100 text-red-800",
    critical: "border border-amber-200 bg-amber-100 text-amber-800",
    soon: "border border-yellow-200 bg-yellow-100 text-yellow-800",
    fresh: "border border-emerald-200 bg-emerald-100 text-emerald-800",
  };
  return (
    <Badge variant={status} className={`whitespace-nowrap ${statusStyles[status]}`}>
      {label}
    </Badge>
  );
}
