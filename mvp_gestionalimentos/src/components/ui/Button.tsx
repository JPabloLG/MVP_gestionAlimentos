"use client";

import React from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const reduced = useReducedMotionSafe();
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none min-h-[44px] px-4";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-surface text-ink border border-border hover:bg-surface-muted",
    ghost: "bg-transparent text-ink hover:bg-surface-muted",
    danger: "bg-expired text-white hover:bg-expired/90",
  };
  const sizes = {
    sm: "text-sm h-9",
    md: "text-sm h-11",
    lg: "text-base h-12",
  };

  const Comp = reduced ? "button" : motion.button;
  const motionProps = reduced
    ? {}
    : {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.99 },
      };

  return (
    <Comp className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...(motionProps as any)} {...props}>
      {children}
    </Comp>
  );
}
