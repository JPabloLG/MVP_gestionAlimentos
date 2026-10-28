"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";

const links = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/inventario", label: "Inventario" },
  { href: "/recetas", label: "Recetas" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <header className="hidden md:block border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="flex items-center gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm hover:text-primary ${
                    pathname === link.href ? "text-primary font-medium" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus size={16} />
              Agregar alimento
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>
      <FoodFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}
