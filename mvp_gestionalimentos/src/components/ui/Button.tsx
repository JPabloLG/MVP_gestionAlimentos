"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const reduced = useReducedMotionSafe();
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none min-h-[44px] px-4";
  const variants = {
    primary: "bg-primary text-white shadow-[0_6px_16px_-8px_rgba(46,125,91,0.8)] hover:bg-primary-dark hover:shadow-[0_8px_20px_-8px_rgba(46,125,91,0.8)]",
    secondary: "bg-surface text-ink border border-border shadow-sm hover:border-primary/30 hover:bg-primary-soft/50",
    ghost: "bg-transparent text-ink hover:bg-surface-muted",
    danger: "bg-expired text-white shadow-sm hover:bg-expired/90",
  };
  const sizes = {
    sm: "text-sm h-9",
    md: "text-sm h-11",
    lg: "text-base h-12",
  };

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={reduced ? undefined : { scale: 1.01 }}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
