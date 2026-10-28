"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

export function AnimatedNumber({ value }: { value: number }) {
  const reduced = useReducedMotionSafe();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    let start = 0;
    const duration = 600;
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };
    requestAnimationFrame(animate);
  }, [value, reduced]);

  return <span>{display}</span>;
}
