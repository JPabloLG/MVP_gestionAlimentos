"use client";

import { useSyncExternalStore } from "react";

// Same breakpoint as Tailwind's `md`, where the layout switches to the top navbar.
const QUERY = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * True on screens at or above the `md` breakpoint.
 *
 * Exists so a component can mount ONE variant (modal or bottom sheet) instead
 * of rendering both and hiding one with CSS: two copies of a form share field
 * names and ids, and React Hook Form only controls the last one mounted.
 * Reports `false` during server render, which is safe for content that only
 * appears after a user action.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
