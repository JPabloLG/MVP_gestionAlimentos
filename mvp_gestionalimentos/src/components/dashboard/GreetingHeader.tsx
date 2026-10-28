"use client";

import React, { useState } from "react";
import { useGreeting } from "@/hooks/useGreeting";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { formatDateES } from "@/lib/format";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";

export function GreetingHeader() {
  const { fullGreeting } = useGreeting();
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display mb-1">{fullGreeting}</h1>
          <p className="text-ink-muted capitalize">{formatDateES(today)}</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="hidden md:flex">
          <Plus size={18} />
          Agregar alimento
        </Button>
      </div>
      <FoodFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
