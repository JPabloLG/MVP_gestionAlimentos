"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-4">🍎</div>
        <h1 className="text-3xl font-display mb-2">Esta página se nos pasó de fecha 🍎</h1>
        <p className="text-ink-muted mb-6">
          Parece que lo que buscas ya no está fresco... o nunca existió.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/">
            <Button>Ir al inicio</Button>
          </Link>
          <Link href={user ? "/dashboard" : "/login"}>
            <Button variant="secondary">Ir a mi nevera</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
