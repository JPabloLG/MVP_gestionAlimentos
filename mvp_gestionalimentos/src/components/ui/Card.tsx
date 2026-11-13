"use client";

import React from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function Card({ children, className = "", animate = true }: CardProps) {
  const reduced = useReducedMotionSafe();
  const still = reduced || !animate;
  return (
    <motion.div
      className={`bg-surface rounded-2xl shadow-sm border border-border p-4 ${className}`}
      whileHover={still ? undefined : { scale: 1.01 }}
      transition={still ? undefined : { duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
