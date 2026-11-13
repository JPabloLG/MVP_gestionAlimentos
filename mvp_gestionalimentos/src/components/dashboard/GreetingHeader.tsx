"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGreeting } from "@/hooks/useGreeting";
import { useFoods } from "@/hooks/useFoods";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ChefHat, Plus } from "lucide-react";
import { formatDateES } from "@/lib/format";
import { getDaysRemaining, getExpiryStatus } from "@/lib/expiry";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";

/** Dashboard hero: greeting, one-line status of the fridge and the two main actions. */
export function GreetingHeader() {
  const { fullGreeting } = useGreeting();
  const { foods } = useFoods();
  const [isOpen, setIsOpen] = useState(false);

  const urgent = foods.filter((f) => {
    const status = getExpiryStatus(getDaysRemaining(f.expiresAt));
    return status === "critical" || status === "soon";
  }).length;

  const summary =
    foods.length === 0
      ? "Registra lo que tienes en tu nevera y te diremos qué usar primero."
      : urgent > 0
        ? `Tienes ${urgent} ${urgent === 1 ? "alimento" : "alimentos"} para usar pronto. ¡Cocina antes de que venzan!`
        : "Todo está bajo control. Sigue así 💚";

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg">
        {/* decorative circles, purely visual */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute right-24 -bottom-16 w-40 h-40 rounded-full bg-white/5" aria-hidden="true" />

        <div className="relative grid sm:grid-cols-[1fr_auto] items-center gap-4 p-5 sm:p-8">
          <div className="min-w-0">
            <p className="text-white/80 text-sm capitalize mb-1">{formatDateES(new Date())}</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display mb-2 break-words">{fullGreeting}</h1>
            <p className="text-white/90 mb-5 max-w-md">{summary}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setIsOpen(true)} className="border-transparent text-primary-dark! font-semibold">
                <Plus size={18} aria-hidden="true" />
                Agregar alimento
              </Button>
              <Link
                href="/recetas"
                className={buttonClasses("ghost", "md", "border border-white/50 text-white! hover:bg-white/10")}
              >
                <ChefHat size={18} aria-hidden="true" />
                Ver recetas
              </Link>
            </div>
          </div>
          <Image
            src="/illustrations/basket.svg"
            alt=""
            width={240}
            height={190}
            priority
            className="hidden sm:block w-40 md:w-56 h-auto drop-shadow-xl"
          />
        </div>
      </section>
      <FoodFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
