"use client";

import { useEffect, useState } from "react";

export function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // set initial value asynchronously to avoid cascading renders
    const id = setTimeout(() => setReduced(mq.matches), 0);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => {
      clearTimeout(id);
      mq.removeEventListener("change", handler);
    };
  }, []);

  return reduced;
}
