"use client";

import React from "react";
import { buttonClasses } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left shadow-lg">
        <Image src="/illustrations/basket.svg" alt="" width={240} height={190} className="w-40 md:w-56 h-auto shrink-0" />
        <div>
        <h2 className="text-2xl md:text-3xl font-display mb-4">Empieza a reducir el desperdicio</h2>
        <p className="text-white/90 mb-6">
          Regístrate gratis y empieza a aprovechar mejor lo que ya tienes
        </p>
        <Link href="/registro" className={buttonClasses("secondary", "lg", "px-6 border-transparent text-primary-dark! font-semibold")}>
          Crear cuenta gratis
        </Link>
        </div>
      </div>
    </section>
  );
}
