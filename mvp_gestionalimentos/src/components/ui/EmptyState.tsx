"use client";

import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function EmptyState({ emoji = "🍎", title, description, actionLabel, onAction, children }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-ink-muted mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
      {children}
    </div>
  );
}
