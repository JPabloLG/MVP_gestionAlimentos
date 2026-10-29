"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/config/site";

export function Hero() {
  const reduced = useReducedMotionSafe();
  const { loginDemo } = useAuth();
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await loginDemo();
      router.push("/dashboard");
    } catch {
      setIsDemoLoading(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={reduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl md:text-6xl font-display font-semibold mb-6"
        >
          {siteConfig.name}
        </motion.h1>
        <motion.p
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={reduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-xl md:text-2xl text-ink-muted mb-8"
        >
          {siteConfig.slogan}
        </motion.p>
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={reduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex gap-3 justify-center flex-wrap"
        >
          <Link href="/registro">
            <Button size="lg">Crear cuenta</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Iniciar sesión
            </Button>
          </Link>
          <Button variant="ghost" size="lg" onClick={handleDemoLogin} disabled={isDemoLoading}>
            {isDemoLoading ? "Entrando..." : "Probar con cuenta demo"}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
