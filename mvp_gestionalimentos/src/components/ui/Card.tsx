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
  const Comp = reduced || !animate ? "div" : motion.div;
  const motionProps = reduced || !animate ? {} : { whileHover: { scale: 1.01 }, transition: { duration: 0.15 } };

  return (
    <Comp
      className={`bg-surface rounded-2xl shadow-sm border border-border p-4 ${className}`}
      {...(motionProps as any)}
    >
      {children}
    </Comp>
  );
}
