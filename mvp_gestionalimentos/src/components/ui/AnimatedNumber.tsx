"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

export function AnimatedNumber({ value }: { value: number }) {
  const reduced = useReducedMotionSafe();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const duration = 600;
    const startTime = Date.now();
    let frame = requestAnimationFrame(function animate() {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      setDisplay(progress < 1 ? Math.floor(progress * value) : value);
      if (progress < 1) frame = requestAnimationFrame(animate);
    });
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);

  // With reduced motion the final value is rendered directly, no animation state needed.
  return <span>{reduced ? value : display}</span>;
}
