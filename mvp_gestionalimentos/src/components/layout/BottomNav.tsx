"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Plus, ChefHat, LogOut } from "lucide-react";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/recetas", label: "Recetas", icon: ChefHat },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border/80 z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-20px_rgba(31,42,36,0.5)]">
        <div className="grid grid-cols-5 items-center h-16">
          {links.slice(0, 2).map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 ${
                  active ? "text-primary" : "text-ink-muted"
                }`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-primary-soft" : ""}`}>
                  <Icon size={20} />
                </span>
                <span className={`text-xs ${active ? "font-semibold" : ""}`}>{link.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center -mt-6"
            aria-label="Agregar alimento"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-background min-h-[44px] min-w-[44px]">
              <Plus size={24} />
            </div>
          </button>
          {links.slice(2).map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 ${
                  active ? "text-primary" : "text-ink-muted"
                }`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-primary-soft" : ""}`}>
                  <Icon size={20} />
                </span>
                <span className={`text-xs ${active ? "font-semibold" : ""}`}>{link.label}</span>
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center gap-1 text-ink-muted"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
            <span className="text-xs">Salir</span>
          </button>
        </div>
      </nav>
      <FoodFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}
