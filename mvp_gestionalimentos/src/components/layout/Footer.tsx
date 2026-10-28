"use client";

import React from "react";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          © {new Date().getFullYear()} {siteConfig.name}. MVP Académico - Universidad del Quindío
        </p>
        <Link href="/terminos" className="text-sm text-ink-muted hover:text-primary">
          Términos y condiciones
        </Link>
      </div>
    </footer>
  );
}
