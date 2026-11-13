"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ChefHat, ChevronDown, Home, LogOut, Package, Plus, UserRound } from "lucide-react";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";

const links = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/recetas", label: "Recetas", icon: ChefHat },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsProfileOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isProfileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 hidden border-b border-stone-200/70 bg-white/85 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center">
            <Logo />
          </div>
          <nav aria-label="Navegación principal" className="flex items-center justify-center gap-1">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:text-emerald-800 ${
                      active ? "bg-emerald-50 font-medium text-emerald-800 ring-1 ring-emerald-200/70" : "text-ink-muted"
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
          </nav>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus size={16} />
              Agregar alimento
            </Button>
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                onClick={() => setIsProfileOpen((open) => !open)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-200/80 bg-white px-3 text-sm font-medium text-ink transition hover:border-emerald-200 hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><UserRound size={15} /></span>
                <span className="max-w-24 truncate">{user?.name || "Mi cuenta"}</span>
                <ChevronDown size={15} className={`text-ink-muted transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>
              {isProfileOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-1.5 shadow-xl shadow-ink/10">
                  <div className="border-b border-stone-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-ink">{user?.name || "Mi cuenta"}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileOpen(false);
                      void logout();
                    }}
                    className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-ink-muted transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <FoodFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}
