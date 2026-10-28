"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😅</div>
        <h1 className="text-2xl font-display mb-2">Algo salió mal</h1>
        <p className="text-ink-muted mb-6">
          No te preocupes, pasa de vez en cuando. Puedes intentarlo de nuevo.
        </p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  );
}
