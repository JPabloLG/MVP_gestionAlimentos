"use client";

import React, { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/config/demo";

export function DemoAccessCard() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const copyCredentials = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(
        `Correo: ${DEMO_EMAIL}\nContraseña: ${DEMO_PASSWORD}`
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("No se pudieron copiar. Puedes seleccionar las credenciales.");
    }
  };

  return (
    <aside className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
          <KeyRound size={16} className="text-emerald-700" />
          Acceso rápido para evaluación / Demo
        </h2>
        <button
          type="button"
          onClick={copyCredentials}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="font-medium text-emerald-900">Correo:</dt>
          <dd className="select-all font-mono text-emerald-950">{DEMO_EMAIL}</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="font-medium text-emerald-900">Contraseña:</dt>
          <dd className="select-all font-mono text-emerald-950">{DEMO_PASSWORD}</dd>
        </div>
      </dl>
      {copyError && <p role="status" className="mt-2 text-xs text-red-800">{copyError}</p>}
    </aside>
  );
}
