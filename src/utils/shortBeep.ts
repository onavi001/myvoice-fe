/**
 * Sonidos del timer — solo síntesis (sin MP3 con voz).
 * Avisos marcados y distinguibles por fase.
 */

export type TimerCue =
  | "work-countdown"
  | "rest-countdown"
  | "prep-countdown"
  | "set-complete"
  | "rest-complete"
  | "workout-complete";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    return audioCtx;
  } catch {
    return null;
  }
}

function createMaster(ctx: AudioContext, volume: number): GainNode {
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  return master;
}

/** Pitido fuerte (serie / esfuerzo). */
function playStrongTick(ctx: AudioContext, t: number, freq: number, volume: number): void {
  const master = createMaster(ctx, volume);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "square";
  osc.frequency.value = freq;
  filter.type = "bandpass";
  filter.frequency.value = freq * 1.15;
  filter.Q.value = 4;
  osc.connect(filter);
  filter.connect(g);
  g.connect(master);
  g.gain.setValueAtTime(0.55, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Doble pitido (descanso). */
function playDoubleTick(ctx: AudioContext, t: number, freq: number, volume: number): void {
  playStrongTick(ctx, t, freq, volume);
  playStrongTick(ctx, t + 0.11, freq * 0.92, volume * 0.85);
}

/** Campana marcada (fin de serie). */
function playSetEndBell(ctx: AudioContext, t: number): void {
  const master = createMaster(ctx, 0.58);
  [523.25, 784, 1046.5, 1318.51].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    osc.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.55 - i * 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.start(t);
    osc.stop(t + 0.46);
  });
}

/** Dos golpes ascendentes (fin de descanso). */
function playGoSignal(ctx: AudioContext, t: number): void {
  const master = createMaster(ctx, 0.55);
  [587.33, 880, 1174.66].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = f;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3000;
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    const start = t + i * 0.12;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.52, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
    osc.start(start);
    osc.stop(start + 0.17);
  });
}

/** Fanfarria al terminar todas las series (sin voz). */
function playWorkoutDone(ctx: AudioContext, t: number): void {
  const master = createMaster(ctx, 0.52);
  const notes = [392, 523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    osc.connect(g);
    g.connect(master);
    const start = t + i * 0.1;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.5, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
    osc.start(start);
    osc.stop(start + 0.41);
  });
  playStrongTick(ctx, t + 0.55, 1318.51, 0.4);
}

function playCue(ctx: AudioContext, cue: TimerCue): void {
  const t = ctx.currentTime;
  switch (cue) {
    case "work-countdown":
      playStrongTick(ctx, t, 1200, 0.5);
      break;
    case "rest-countdown":
      playDoubleTick(ctx, t, 520, 0.45);
      break;
    case "prep-countdown":
      playStrongTick(ctx, t, 880, 0.42);
      playStrongTick(ctx, t + 0.12, 1100, 0.38);
      break;
    case "set-complete":
      playSetEndBell(ctx, t);
      break;
    case "rest-complete":
      playGoSignal(ctx, t);
      break;
    case "workout-complete":
      playWorkoutDone(ctx, t);
      break;
  }
}

export async function primeTimerAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

export function playTimerCue(cue: TimerCue): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  void (async () => {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    playCue(ctx, cue);
  })();
}

/** @deprecated Usar playTimerCue("work-countdown"). */
export function playShortBeep(): void {
  playTimerCue("work-countdown");
}
