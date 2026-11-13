"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonStyles";

export { buttonClasses };

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.button
      className={buttonClasses(variant, size, className)}
      whileHover={reduced ? undefined : { scale: 1.01 }}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
