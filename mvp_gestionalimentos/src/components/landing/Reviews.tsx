import React from "react";
import { Star } from "lucide-react";

const sampleReviews = [
  {
    name: "Persona de prueba 01",
    context: "Hogar unipersonal",
    initials: "01",
    color: "bg-[#FCE9D6] text-[#A65D22]",
    quote: "Ahora tengo más presente qué alimentos debo usar primero. La lista por fechas me ayuda a organizarme.",
  },
  {
    name: "Persona de prueba 02",
    context: "Familia pequeña",
    initials: "02",
    color: "bg-[#E3F2EA] text-primary",
    quote: "Las ideas de recetas hacen más fácil decidir qué cocinar con lo que ya hay en casa.",
  },
  {
    name: "Persona de prueba 03",
    context: "Estudiante",
    initials: "03",
    color: "bg-[#F4E8F4] text-[#805080]",
    quote: "Me gusta poder registrar lo que compré y revisar rápido qué está próximo a vencerse.",
  },
];

export function Reviews() {
  return (
    <section id="resenas" className="px-4 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Lo que podrías descubrir</p>
            <h2 className="max-w-xl text-3xl font-semibold leading-tight md:text-4xl">Una rutina más sencilla empieza con pequeños cambios.</h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-2 text-xs font-semibold text-[#79551F]">
            <span className="h-2 w-2 rounded-full bg-accent" /> Reseñas de ejemplo · datos de prueba
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {sampleReviews.map((review) => (
            <article key={review.initials} className="flex h-full flex-col rounded-3xl border border-border/70 bg-white p-6 shadow-[0_8px_30px_-20px_rgba(31,42,36,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-5 flex gap-1 text-[#E4A62E]" aria-label="Calificación de ejemplo: 5 de 5">
                {Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill="currentColor" strokeWidth={1.5} />)}
              </div>
              <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">Opinión ficticia para demostración</span>
              <blockquote className="flex-1 text-[15px] leading-relaxed text-ink">“{review.quote}”</blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${review.color}`}>{review.initials}</span>
                <div><p className="text-sm font-semibold">{review.name}</p><p className="mt-0.5 text-xs text-ink-muted">{review.context}</p></div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-ink-muted">
          Contenido ilustrativo creado para probar el diseño; no son testimonios ni calificaciones de usuarios reales.
        </p>
      </div>
    </section>
  );
}
