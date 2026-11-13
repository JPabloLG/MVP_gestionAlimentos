/** Minutos sugeridos por un paso ("5-6 minutos" → 6, "un minuto" → 1). null si no menciona tiempo. */
export function parseStepMinutes(step: string): number | null {
  const text = step.toLocaleLowerCase("es");
  const range = text.match(/(\d+)\s*(?:-|a)\s*(\d+)\s*min/);
  if (range) return Number(range[2]);
  const single = text.match(/(\d+)\s*min/);
  if (single) return Number(single[1]);
  if (/\bun\s+minuto\b/.test(text)) return 1;
  const hours = text.match(/(\d+)\s*hora/);
  if (hours) return Number(hours[1]) * 60;
  return null;
}

/** 125 → "02:05"; 3725 → "1:02:05". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

let audioCtx: AudioContext | null = null;

/** Debe llamarse desde un gesto del usuario (iniciar temporizador) para que el navegador permita sonar luego. */
export function unlockAlarmAudio() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  audioCtx ??= new Ctx();
  void audioCtx.resume();
}

/** Toca una ráfaga de tres pitidos. Devuelve false si no hay audio disponible. */
export function playAlarmBurst(): boolean {
  if (!audioCtx) unlockAlarmAudio();
  if (!audioCtx) return false;
  const now = audioCtx.currentTime;
  [0, 0.28, 0.56].forEach((offset, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = "sine";
    osc.frequency.value = i === 2 ? 1175 : 880;
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.22);
    osc.connect(gain).connect(audioCtx!.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.25);
  });
  return true;
}
