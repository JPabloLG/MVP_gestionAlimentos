"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BellRing, Check, ChevronLeft, ChevronRight, CircleStop, Clock, ListChecks, Minus,
  Pause, Play, Plus, RotateCcw, Timer, UtensilsCrossed, X, PartyPopper, CookingPot,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { recipes } from "@/data/recipes";
import { useCookRecipe } from "@/hooks/useCookRecipe";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { formatClock, parseStepMinutes, playAlarmBurst, unlockAlarmAudio } from "@/lib/cooking";
import { getDaysRemaining } from "@/lib/expiry";
import { matchesIngredient } from "@/lib/recipes";
import type { Recipe } from "@/types";

type TimerState =
  | { status: "idle"; duration: number }
  | { status: "running"; duration: number; endAt: number }
  | { status: "paused"; duration: number; remaining: number }
  | { status: "ringing"; duration: number };

const PRESETS = [1, 3, 5, 10, 15, 30];
const MAX_MINUTES = 240;
const ALARM_MAX_MS = 90_000; // deja de sonar sola tras 90 s para no molestar si nadie la atiende

export default function CocinarPage() {
  return (
    <AuthGuard>
      <CookingMode />
    </AuthGuard>
  );
}

function CookingMode() {
  const { id } = useParams<{ id: string }>();
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#10291f] p-6 text-center text-white">
        <span className="text-5xl">🍽️</span>
        <p className="text-lg">No encontramos esta receta.</p>
        <Link href="/recetas" className="rounded-xl bg-white px-4 py-2.5 font-semibold text-[#10291f]">Volver a recetas</Link>
      </main>
    );
  }
  return <CookingSession recipe={recipe} />;
}

function CookingSession({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const reduced = useReducedMotionSafe();
  const { foods, insight, isCooking, done, markCooked } = useCookRecipe(recipe);

  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [timerLabel, setTimerLabel] = useState("Receta completa");
  const [timer, setTimer] = useState<TimerState>({ status: "idle", duration: recipe.timeMinutes * 60 });

  const stepMinutes = useMemo(() => recipe.steps.map(parseStepMinutes), [recipe.steps]);
  const isLast = step === recipe.steps.length - 1;
  const remaining =
    timer.status === "running" ? Math.max(0, (timer.endAt - now) / 1000)
    : timer.status === "paused" ? timer.remaining
    : timer.status === "ringing" ? 0
    : timer.duration;
  const progress = timer.duration > 0 ? remaining / timer.duration : 0;
  const timerActive = timer.status === "running" || timer.status === "paused";

  // Reloj: refresca la UI y detecta el fin. Usa endAt absoluto, así no se desfasa si la pestaña queda en segundo plano.
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setTimer((cur) => (cur.status === "running" && t >= cur.endAt ? { status: "ringing", duration: cur.duration } : cur));
    }, timer.status === "running" ? 250 : 1000);
    return () => clearInterval(id);
  }, [timer.status]);

  // Alarma: sonido repetido, vibración, título parpadeante y notificación si la pestaña está oculta.
  useEffect(() => {
    if (timer.status !== "ringing") return;
    const originalTitle = document.title;
    const ring = () => {
      playAlarmBurst();
      navigator.vibrate?.([300, 150, 300, 150, 600]);
    };
    ring();
    const sound = setInterval(ring, 1600);
    let flip = false;
    const title = setInterval(() => {
      flip = !flip;
      document.title = flip ? "⏰ ¡Tiempo!" : originalTitle;
    }, 800);
    const stop = setTimeout(() => clearInterval(sound), ALARM_MAX_MS);
    if (document.hidden && "Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ ¡Se acabó el tiempo!", { body: `${recipe.title} · ${timerLabel}`, tag: "gestionalo-timer" });
    }
    return () => {
      clearInterval(sound);
      clearInterval(title);
      clearTimeout(stop);
      navigator.vibrate?.(0);
      document.title = originalTitle;
    };
  }, [timer.status, recipe.title, timerLabel]);

  // Mantiene la pantalla encendida mientras se cocina (si el navegador lo soporta).
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        lock = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {
        // sin soporte o sin permiso: no es crítico
      }
    };
    const onVisible = () => document.visibilityState === "visible" && void request();
    void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, []);

  // Avisa antes de cerrar la pestaña con un temporizador en marcha.
  useEffect(() => {
    if (!timerActive) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [timerActive]);

  const startTimer = useCallback((seconds: number, label?: string) => {
    unlockAlarmAudio();
    if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
    if (label) setTimerLabel(label);
    setTimer({ status: "running", duration: seconds, endAt: Date.now() + seconds * 1000 });
  }, []);

  const toggleTimer = useCallback(() => {
    if (timer.status === "idle") return startTimer(timer.duration);
    unlockAlarmAudio();
    setTimer((t) => {
      if (t.status === "running") return { status: "paused", duration: t.duration, remaining: Math.max(0, (t.endAt - Date.now()) / 1000) };
      if (t.status === "paused") return { status: "running", duration: t.duration, endAt: Date.now() + t.remaining * 1000 };
      return t;
    });
  }, [timer, startTimer]);

  const addMinute = (delta: number) => {
    setTimer((t) => {
      if (t.status === "idle") {
        const minutes = Math.min(MAX_MINUTES, Math.max(1, Math.round(t.duration / 60) + delta));
        return { status: "idle", duration: minutes * 60 };
      }
      if (t.status === "running") return { ...t, duration: t.duration + delta * 60, endAt: t.endAt + delta * 60_000 };
      if (t.status === "paused") return { ...t, duration: t.duration + delta * 60, remaining: t.remaining + delta * 60 };
      return t;
    });
  };

  const resetTimer = () => setTimer((t) => ({ status: "idle", duration: t.duration }));
  const choosePreset = (minutes: number, label: string) => {
    setTimerLabel(label);
    setTimer({ status: "idle", duration: minutes * 60 });
  };

  const goTo = useCallback((next: number) => {
    setStep(Math.min(recipe.steps.length - 1, Math.max(0, next)));
  }, [recipe.steps.length]);

  const handleNext = () => (isLast ? setFinished(true) : goTo(step + 1));

  // Atajos: ← → para pasos, espacio para iniciar/pausar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (finished || confirmExit || target.closest("button, input, a, summary, [role=dialog]")) return;
      if (e.key === "ArrowRight") goTo(step + 1);
      else if (e.key === "ArrowLeft") goTo(step - 1);
      else if (e.key === " ") {
        e.preventDefault();
        toggleTimer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, goTo, toggleTimer, finished, confirmExit]);

  const exit = () => router.push(`/recetas/${recipe.id}`);
  const requestExit = () => (timerActive || step > 0 ? setConfirmExit(true) : exit());

  const hasIngredient = (key: string) =>
    foods.some((food) => getDaysRemaining(food.expiresAt) >= 0 && matchesIngredient(key, food.name));
  const toggleChecked = (idx: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

  const elapsed = (now - startedAt) / 1000;
  const suggested = stepMinutes[step];

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#0f2a1f] text-white">
      {/* Decoración de fondo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      {/* Encabezado */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0f2a1f]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={requestExit}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <X size={18} /> <span className="hidden sm:inline">Salir</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Modo cocina</p>
            <h1 className="truncate text-base font-semibold sm:text-lg">
              <span aria-hidden className="mr-1.5">{recipe.emoji}</span>{recipe.title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm tabular-nums text-white/80" title="Tiempo cocinando">
            <Clock size={15} className="text-emerald-300" /> {formatClock(elapsed)}
          </div>
        </div>
        {!finished && (
          <div className="mx-auto flex max-w-6xl gap-1 px-4 pb-3 sm:px-6" aria-hidden>
            {recipe.steps.map((_, idx) => (
              <span key={idx} className={`h-1.5 flex-1 rounded-full transition-colors ${idx <= step ? "bg-emerald-400" : "bg-white/15"}`} />
            ))}
          </div>
        )}
      </header>

      {finished ? (
        <FinishedScreen
          recipe={recipe}
          elapsed={elapsed}
          canDiscount={!!insight?.usedFoods.length && !done}
          usedFoodNames={insight?.usedFoods.map((f) => f.foodName) ?? []}
          isCooking={isCooking}
          done={done}
          onDiscount={markCooked}
          onBack={() => setFinished(false)}
        />
      ) : (
        <main className="relative mx-auto grid max-w-6xl gap-5 px-4 pb-32 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6 lg:pt-8">
          {/* Paso actual */}
          <section className="space-y-5">
            <div className="relative min-h-[16rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 sm:p-9">
              <span aria-hidden className="pointer-events-none absolute -right-4 -top-6 select-none text-[9rem] leading-none opacity-[0.07]">{recipe.emoji}</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.22 }}
                  aria-live="polite"
                >
                  <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Paso {step + 1} de {recipe.steps.length}
                  </p>
                  <p className="font-[family-name:var(--font-fraunces)] text-2xl leading-snug sm:text-3xl lg:text-4xl">
                    {recipe.steps[step]}
                  </p>
                  {suggested && (
                    <button
                      type="button"
                      onClick={() => startTimer(suggested * 60, `Paso ${step + 1}`)}
                      className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-4 text-sm font-semibold text-amber-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
                    >
                      <Timer size={17} /> Iniciar temporizador de {suggested} min para este paso
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Lista de pasos */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <h2 className="mb-3 text-sm font-semibold text-white/70">Todos los pasos</h2>
              <ol className="space-y-1.5">
                {recipe.steps.map((s, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => goTo(idx)}
                      aria-current={idx === step ? "step" : undefined}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                        idx === step ? "bg-emerald-400/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
                      }`}
                    >
                      <span className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        idx < step ? "bg-emerald-400 text-emerald-950" : idx === step ? "bg-white text-[#0f2a1f]" : "bg-white/10"
                      }`}>
                        {idx < step ? <Check size={13} strokeWidth={3} /> : idx + 1}
                      </span>
                      <span className={idx < step ? "line-through decoration-white/30" : ""}>{s}</span>
                      {stepMinutes[idx] && (
                        <span className="ml-auto shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{stepMinutes[idx]} min</span>
                      )}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Columna lateral: temporizador + ingredientes */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <TimerCard
              timer={timer}
              label={timerLabel}
              remaining={remaining}
              progress={progress}
              recipeMinutes={recipe.timeMinutes}
              suggested={suggested}
              step={step}
              onToggle={toggleTimer}
              onReset={resetTimer}
              onAdd={addMinute}
              onPreset={choosePreset}
            />

            <details className="group rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                <span className="inline-flex items-center gap-2"><ListChecks size={17} className="text-emerald-300" /> Ingredientes</span>
                <span className="text-xs font-normal text-white/60">{checked.size}/{recipe.ingredients.length} listos <ChevronRight size={14} className="inline transition group-open:rotate-90" /></span>
              </summary>
              <ul className="mt-3 space-y-1">
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = checked.has(idx);
                  return (
                    <li key={idx}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm transition hover:bg-white/5">
                        <input type="checkbox" checked={isChecked} onChange={() => toggleChecked(idx)} className="h-5 w-5 shrink-0 accent-emerald-400" />
                        <span className={`flex-1 ${isChecked ? "text-white/40 line-through" : "text-white/90"}`}>
                          {ing.label}
                          {ing.optional && <span className="ml-1 text-xs text-white/50">(opcional)</span>}
                        </span>
                        {hasIngredient(ing.key || ing.label) && (
                          <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">En casa</span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </details>

            <p className="hidden text-center text-xs text-white/40 lg:block">
              Atajos: ← → para cambiar de paso · Espacio para iniciar/pausar
            </p>
          </aside>
        </main>
      )}

      {/* Barra inferior de navegación entre pasos */}
      {!finished && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0f2a1f]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md" aria-label="Navegación de pasos">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-2xl border border-white/15 px-4 font-semibold transition hover:bg-white/10 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <ChevronLeft size={20} /> <span className="hidden sm:inline">Anterior</span>
            </button>
            <MiniTimer timer={timer} remaining={remaining} onToggle={toggleTimer} />
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-400 px-5 font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:flex-none"
            >
              {isLast ? <>Terminar <Check size={20} /></> : <>Siguiente <ChevronRight size={20} /></>}
            </button>
          </div>
        </nav>
      )}

      {/* Alarma */}
      <AnimatePresence>
        {timer.status === "ringing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alarm-title"
          >
            <motion.div
              initial={reduced ? undefined : { scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-[2rem] bg-white p-7 text-center text-ink shadow-2xl"
            >
              <span className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 ${reduced ? "" : "animate-[ring_0.9s_ease-in-out_infinite]"}`}>
                <BellRing size={40} />
              </span>
              <h2 id="alarm-title" className="text-2xl font-semibold">¡Se acabó el tiempo!</h2>
              <p className="mt-1 text-sm text-ink-muted">{timerLabel} · {recipe.title}</p>
              <button
                type="button"
                autoFocus
                onClick={resetTimer}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-white transition hover:bg-primary-dark"
              >
                <CircleStop size={19} /> Detener alarma
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[1, 5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => startTimer(m * 60)}
                    className="inline-flex min-h-11 items-center justify-center gap-1 rounded-2xl border border-border font-semibold transition hover:bg-primary-soft"
                  >
                    <Plus size={16} /> {m} min más
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmExit}
        onClose={() => setConfirmExit(false)}
        onConfirm={exit}
        title="¿Salir del modo cocina?"
        description={timerActive ? "Tienes un temporizador en marcha. Si sales, se cancelará y perderás tu progreso." : "Perderás el progreso de los pasos de esta receta."}
        confirmLabel="Sí, salir"
        cancelLabel="Seguir cocinando"
        variant="danger"
      />
    </div>
  );
}

interface TimerCardProps {
  timer: TimerState;
  label: string;
  remaining: number;
  progress: number;
  recipeMinutes: number;
  suggested: number | null;
  step: number;
  onToggle: () => void;
  onReset: () => void;
  onAdd: (delta: number) => void;
  onPreset: (minutes: number, label: string) => void;
}

function TimerCard({ timer, label, remaining, progress, recipeMinutes, suggested, step, onToggle, onReset, onAdd, onPreset }: TimerCardProps) {
  const R = 88;
  const C = 2 * Math.PI * R;
  const idle = timer.status === "idle";
  const running = timer.status === "running";
  const urgent = running && remaining <= 10;
  const presetMinutes = Math.round(timer.duration / 60);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.1] to-white/[0.03] p-5 shadow-2xl shadow-black/20 sm:p-6" aria-label="Temporizador">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold"><Timer size={17} className="text-amber-300" /> Temporizador</h2>
        <span className="max-w-[55%] truncate rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/75">{label}</span>
      </div>

      <div className="relative mx-auto my-3 aspect-square w-full max-w-[15rem]">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle
            cx="100" cy="100" r={R} fill="none"
            stroke={urgent ? "#fbbf24" : "#34d399"}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-semibold tabular-nums tracking-tight ${remaining >= 3600 ? "text-4xl" : "text-5xl"} ${urgent ? "text-amber-300" : ""}`} role="timer" aria-live="off">
            {formatClock(remaining)}
          </span>
          <span className="mt-1 text-xs text-white/55">
            {running ? "En marcha" : timer.status === "paused" ? "En pausa" : timer.status === "ringing" ? "¡Listo!" : "Listo para iniciar"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => onAdd(-1)} disabled={!idle && remaining <= 60} aria-label="Restar un minuto"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 transition hover:bg-white/10 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <Minus size={18} />
        </button>
        <button type="button" onClick={onToggle} aria-label={running ? "Pausar" : "Iniciar"}
          className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
            running ? "bg-amber-300 text-amber-950 shadow-amber-500/30 hover:bg-amber-200" : "bg-emerald-400 text-emerald-950 shadow-emerald-500/30 hover:bg-emerald-300"
          }`}>
          {running ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
        </button>
        <button type="button" onClick={() => onAdd(1)} aria-label="Sumar un minuto"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <Plus size={18} />
        </button>
      </div>

      {idle ? (
        <div className="mt-5">
          <p className="mb-2 text-xs text-white/55">Elige un tiempo</p>
          <div className="flex flex-wrap gap-1.5">
            <PresetChip active={presetMinutes === recipeMinutes && label === "Receta completa"} onClick={() => onPreset(recipeMinutes, "Receta completa")}>
              <UtensilsCrossed size={12} /> Receta · {recipeMinutes} min
            </PresetChip>
            {suggested && (
              <PresetChip active={presetMinutes === suggested && label === `Paso ${step + 1}`} onClick={() => onPreset(suggested, `Paso ${step + 1}`)}>
                Paso {step + 1} · {suggested} min
              </PresetChip>
            )}
            {PRESETS.map((m) => (
              <PresetChip key={m} active={presetMinutes === m && label === `${m} min`} onClick={() => onPreset(m, `${m} min`)}>
                {m} min
              </PresetChip>
            ))}
          </div>
        </div>
      ) : (
        <button type="button" onClick={onReset}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 text-sm font-semibold text-white/85 transition hover:bg-red-500/15 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <RotateCcw size={16} /> Cancelar temporizador
        </button>
      )}
    </section>
  );
}

function PresetChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
        active ? "border-emerald-300 bg-emerald-400/20 text-emerald-100" : "border-white/15 text-white/75 hover:bg-white/10"
      }`}>
      {children}
    </button>
  );
}

function MiniTimer({ timer, remaining, onToggle }: { timer: TimerState; remaining: number; onToggle: () => void }) {
  if (timer.status !== "running" && timer.status !== "paused") return null;
  return (
    <button type="button" onClick={onToggle} aria-label={timer.status === "running" ? "Pausar temporizador" : "Reanudar temporizador"}
      className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white/10 px-3 font-semibold tabular-nums transition hover:bg-white/15 lg:hidden">
      {timer.status === "running" ? <Pause size={16} /> : <Play size={16} />} {formatClock(remaining)}
    </button>
  );
}

interface FinishedProps {
  recipe: Recipe;
  elapsed: number;
  canDiscount: boolean;
  usedFoodNames: string[];
  isCooking: boolean;
  done: boolean;
  onDiscount: () => void;
  onBack: () => void;
}

function FinishedScreen({ recipe, elapsed, canDiscount, usedFoodNames, isCooking, done, onDiscount, onBack }: FinishedProps) {
  return (
    <main className="relative mx-auto flex max-w-xl flex-col items-center px-4 py-12 text-center sm:py-16">
      <motion.span initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400/15 text-6xl">
        {recipe.emoji}
      </motion.span>
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"><PartyPopper size={17} /> ¡Receta terminada!</p>
      <h2 className="text-3xl font-semibold sm:text-4xl">¡Buen provecho!</h2>
      <p className="mt-3 text-white/70">
        Preparaste <strong className="text-white">{recipe.title}</strong> en <strong className="text-white tabular-nums">{formatClock(elapsed)}</strong>.
      </p>

      <div className="mt-8 w-full rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left">
        <h3 className="flex items-center gap-2 font-semibold"><CookingPot size={18} className="text-amber-300" /> Actualiza tu inventario</h3>
        <p className="mt-1 text-sm text-white/65">
          {done
            ? "¡Listo! Ya descontamos los ingredientes usados."
            : usedFoodNames.length
              ? "Descontaremos un ingrediente por alimento, priorizando los que vencen primero."
              : "No hay ingredientes vigentes de esta receta en tu inventario."}
        </p>
        {usedFoodNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[...new Set(usedFoodNames)].map((name) => (
              <span key={name} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{name}</span>
            ))}
          </div>
        )}
        <button type="button" onClick={onDiscount} disabled={!canDiscount || isCooking}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-40">
          <Check size={18} /> {done ? "Inventario actualizado" : isCooking ? "Actualizando..." : "Descontar del inventario"}
        </button>
      </div>

      <div className="mt-4 grid w-full gap-2 sm:grid-cols-2">
        <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 font-semibold transition hover:bg-white/10">
          <ChevronLeft size={18} /> Volver a los pasos
        </button>
        <Link href="/recetas" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 font-semibold transition hover:bg-white/10">
          Ver más recetas <ChevronRight size={18} />
        </Link>
      </div>
    </main>
  );
}
