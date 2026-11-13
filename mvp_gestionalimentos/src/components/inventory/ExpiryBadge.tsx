"use client";

import React from "react";
import { getDaysRemaining, getExpiryStatus, getExpiryLabel } from "@/lib/expiry";
import { statusMeta } from "./statusMeta";

/** Remaining-days pill: icon + text + color, so it reads without color vision (RN-03, RN-05). */
export function ExpiryBadge({ expiresAt, className = "" }: { expiresAt: string; className?: string }) {
  const days = getDaysRemaining(expiresAt);
  const meta = statusMeta[getExpiryStatus(days)];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${meta.soft} ${meta.text} ${className}`}
    >
      <Icon size={13} aria-hidden="true" />
      {getExpiryLabel(days)}
    </span>
  );
}
