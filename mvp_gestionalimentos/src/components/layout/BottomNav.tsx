"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Plus, ChefHat, LogOut } from "lucide-react";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/recetas", label: "Recetas", icon: ChefHat },
];

function NavLink({ href, label, icon: Icon, active }: (typeof links)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex flex-col items-center justify-center gap-0.5 h-full min-w-0 ${
        active ? "text-primary font-semibold" : "text-ink-muted"
      }`}
    >
      {active && <span className="absolute top-0 h-1 w-8 rounded-b-full bg-primary" aria-hidden="true" />}
      <Icon size={22} aria-hidden="true" />
      <span className="text-[11px] truncate max-w-full">{label}</span>
    </Link>
  );
}

/** Mobile navigation (hidden from md up, where the top navbar takes over). */
export function BottomNav() {
  const pathname = usePathname();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { logout } = useAuth();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-border z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 items-center h-16">
          {links.slice(0, 2).map((link) => (
            <NavLink key={link.href} {...link} active={isActive(link.href)} />
          ))}
          <div className="flex justify-center">
            <button
              onClick={() => setIsFormOpen(true)}
              className="-mt-7 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg ring-4 ring-background focus-visible:outline-none focus-visible:ring-primary/40"
              aria-label="Agregar alimento"
            >
              <Plus size={26} aria-hidden="true" />
            </button>
          </div>
          {links.slice(2).map((link) => (
            <NavLink key={link.href} {...link} active={isActive(link.href)} />
          ))}
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex flex-col items-center justify-center gap-0.5 h-full text-ink-muted"
          >
            <LogOut size={22} aria-hidden="true" />
            <span className="text-[11px]">Salir</span>
          </button>
        </div>
      </nav>
      <FoodFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      <ConfirmDialog
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={logout}
        title="Cerrar sesión"
        description="Tus alimentos quedan guardados en este navegador. ¿Quieres salir?"
        confirmLabel="Salir"
      />
    </>
  );
}
