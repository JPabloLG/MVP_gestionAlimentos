"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-display mb-4">Empieza a reducir el desperdicio</h2>
        <p className="text-ink-muted mb-6">
          Regístrate gratis y empieza a aprovechar mejor lo que ya tienes
        </p>
        <Link href="/registro">
          <Button size="lg">Crear cuenta gratis</Button>
        </Link>
      </div>
    </section>
  );
}
