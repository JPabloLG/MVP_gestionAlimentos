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
  return (
    <motion.div
      className={`rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md ${className}`}
      whileHover={reduced || !animate ? undefined : { y: -2 }}
      transition={reduced || !animate ? undefined : { duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
