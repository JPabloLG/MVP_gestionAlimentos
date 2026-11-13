"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/layout/Logo";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { siteConfig } from "@/config/site";

/** Landing hero: brand, promise, the two entry points and an illustration of the traffic light. */
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
  const fadeUp = (delay: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } };

  return (
    <section className="relative overflow-hidden px-4 pt-6 pb-12 md:pb-20 bg-gradient-to-b from-primary-soft to-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 md:mb-16">
          <Logo />
        </div>
        <div className="grid md:grid-cols-2 items-center gap-10">
          <div className="text-center md:text-left">
            <motion.p {...fadeUp(0)} className="inline-block rounded-full bg-surface px-3 py-1 text-sm font-medium text-primary shadow-sm mb-4">
              🥑 Menos desperdicio en tu cocina
            </motion.p>
            <motion.h1 {...fadeUp(0.05)} className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold mb-4">
              {siteConfig.name}
            </motion.h1>
            <motion.p {...fadeUp(0.1)} className="text-xl md:text-2xl text-ink-muted mb-8">
              {siteConfig.slogan}
            </motion.p>
            <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link href="/registro" className={buttonClasses("primary", "lg", "px-6")}>
                Crear cuenta
              </Link>
              <Link href="/login" className={buttonClasses("secondary", "lg", "px-6")}>
                Iniciar sesión
              </Link>
            </motion.div>
            <motion.div {...fadeUp(0.25)} className="mt-3 text-center md:text-left">
              <Button variant="ghost" size="lg" className="text-primary! underline-offset-4 hover:underline" onClick={handleDemoLogin} disabled={isDemoLoading}>
                {isDemoLoading ? "Entrando..." : "Probar con cuenta demo"}
              </Button>
            </motion.div>
          </div>
          <motion.div {...fadeUp(0.15)} className="flex justify-center">
            <Image
              src="/illustrations/fridge.svg"
              alt="Nevera con alimentos y un semáforo de vencimiento"
              width={320}
              height={300}
              priority
              className="w-64 sm:w-80 md:w-full max-w-md h-auto drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
