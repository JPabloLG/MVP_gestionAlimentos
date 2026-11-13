"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "fresh" | "soon" | "critical" | "expired" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants = {
    fresh: "bg-fresh-soft text-fresh-ink",
    soon: "bg-soon-soft text-soon-ink",
    critical: "bg-critical-soft text-critical-ink",
    expired: "bg-expired-soft text-expired",
    default: "bg-surface-muted text-ink",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
