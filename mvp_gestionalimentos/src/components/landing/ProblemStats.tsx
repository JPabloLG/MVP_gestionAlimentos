import React from "react";

/** The problem in numbers. Only figures allowed by the project document (DNP, 2016). */
const figures = [
  { value: "9,76 M", label: "toneladas de alimentos se pierden o desperdician al año en Colombia" },
  { value: "34 %", label: "de la oferta de alimentos del país termina perdida o desperdiciada" },
  { value: "1,53 M", label: "toneladas se desperdician en los hogares" },
];

export function ProblemStats() {
  return (
    <section className="px-4 py-10" aria-labelledby="problema">
      <div className="max-w-6xl mx-auto">
        <h2 id="problema" className="sr-only">
          El problema
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {figures.map((f) => (
            <div key={f.value} className="bg-surface rounded-2xl border border-border shadow-sm p-5 text-center sm:text-left">
              <p className="text-3xl md:text-4xl font-display font-semibold text-primary mb-1">{f.value}</p>
              <p className="text-sm text-ink-muted">{f.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-muted mt-3 text-center sm:text-right">Fuente: DNP, 2016.</p>
      </div>
    </section>
  );
}
