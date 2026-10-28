"use client";

import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = "", id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1 text-ink">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 min-h-[44px] ${error ? "border-expired" : ""} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-expired mt-1">{error}</p>}
    </div>
  );
}
