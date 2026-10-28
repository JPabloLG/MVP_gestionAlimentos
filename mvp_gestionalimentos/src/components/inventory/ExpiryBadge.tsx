"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { getDaysRemaining, getExpiryStatus, getExpiryLabel } from "@/lib/expiry";

export function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
  const days = getDaysRemaining(expiresAt);
  const status = getExpiryStatus(days);
  const label = getExpiryLabel(days);
  return <Badge variant={status}>{label}</Badge>;
}
