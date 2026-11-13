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
        className={`w-full rounded-xl border border-border bg-white/90 px-4 py-3 text-ink shadow-sm transition placeholder:text-ink-muted/70 hover:border-primary/30 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 min-h-[48px] ${error ? "border-expired focus-visible:border-expired focus-visible:ring-expired/10" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-expired mt-1">{error}</p>}
    </div>
  );
}
