"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1 text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 min-h-[44px] ${error ? "border-expired" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-expired mt-1">{error}</p>}
    </div>
  );
}
