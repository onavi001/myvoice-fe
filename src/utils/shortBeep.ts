/**
 * Sonidos del timer — síntesis Web Audio (web) y WAV por HTMLAudio (app nativa, más volumen).
 */
import { Capacitor } from "@capacitor/core";

export type TimerCue =
  | "work-countdown"
  | "rest-countdown"
  | "prep-countdown"
  | "set-complete"
  | "rest-complete"
  | "workout-complete";

/** Ganancia global del bus Web Audio (>1 amplifica; pitidos cortos toleran clip suave). */
const WEB_MASTER_GAIN = 4.2;

let audioCtx: AudioContext | null = null;
let webBus: GainNode | null = null;

const nativeUrlCache = new Map<string, string>();
const nativeAudioPool = new Map<TimerCue, HTMLAudioElement>();

function getAudioContext(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) {
      audioCtx = new Ctx({ latencyHint: "interactive" });
      webBus = audioCtx.createGain();
      webBus.gain.value = WEB_MASTER_GAIN;
      webBus.connect(audioCtx.destination);
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function getWebBus(ctx: AudioContext): GainNode {
  if (!webBus) {
    webBus = ctx.createGain();
    webBus.gain.value = WEB_MASTER_GAIN;
    webBus.connect(ctx.destination);
  }
  return webBus;
}

/** Pitido fuerte (serie / esfuerzo). */
function playStrongTick(ctx: AudioContext, t: number, freq: number, volume: number): void {
  const master = getWebBus(ctx);
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "sawtooth";
  osc.frequency.value = freq;
  osc2.type = "square";
  osc2.frequency.value = freq * 2;
  filter.type = "bandpass";
  filter.frequency.value = freq * 1.2;
  filter.Q.value = 2.5;
  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(g);
  g.connect(master);
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  osc.start(t);
  osc2.start(t);
  osc.stop(t + 0.15);
  osc2.stop(t + 0.15);
}

function playDoubleTick(ctx: AudioContext, t: number, freq: number, volume: number): void {
  playStrongTick(ctx, t, freq, volume);
  playStrongTick(ctx, t + 0.12, freq * 0.92, volume * 0.9);
}

function playSetEndBell(ctx: AudioContext, t: number): void {
  const master = getWebBus(ctx);
  [523.25, 784, 1046.5, 1318.51].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    osc.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.95 - i * 0.1, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.51);
  });
}

function playGoSignal(ctx: AudioContext, t: number): void {
  const master = getWebBus(ctx);
  [587.33, 880, 1174.66].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = f;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 4000;
    osc.connect(filter);
    filter.connect(g);
    g.connect(master);
    const start = t + i * 0.12;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.95, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.start(start);
    osc.stop(start + 0.19);
  });
}

function playWorkoutDone(ctx: AudioContext, t: number): void {
  const master = getWebBus(ctx);
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
    g.gain.linearRampToValueAtTime(0.9, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
    osc.start(start);
    osc.stop(start + 0.43);
  });
  playStrongTick(ctx, t + 0.55, 1318.51, 0.85);
}

function playWebCue(ctx: AudioContext, cue: TimerCue): void {
  const t = ctx.currentTime;
  switch (cue) {
    case "work-countdown":
      playStrongTick(ctx, t, 1200, 0.95);
      break;
    case "rest-countdown":
      playDoubleTick(ctx, t, 520, 0.9);
      break;
    case "prep-countdown":
      playStrongTick(ctx, t, 880, 0.9);
      playStrongTick(ctx, t + 0.12, 1100, 0.85);
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

/** Genera WAV mono 16-bit para HTMLAudio (mejor volumen en WebView Android). */
function encodeWavDataUrl(
  segments: { freq: number; startMs: number; durationMs: number; gain?: number }[],
  totalMs: number,
  sampleRate = 44100
): string {
  const cacheKey = JSON.stringify({ segments, totalMs, sampleRate });
  const cached = nativeUrlCache.get(cacheKey);
  if (cached) return cached;

  const totalSamples = Math.floor((sampleRate * totalMs) / 1000);
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, totalSamples * 2, true);

  const samples = new Float32Array(totalSamples);
  for (const seg of segments) {
    const start = Math.floor((sampleRate * seg.startMs) / 1000);
    const len = Math.floor((sampleRate * seg.durationMs) / 1000);
    const gain = seg.gain ?? 0.98;
    const attack = Math.max(8, Math.floor(sampleRate * 0.004));
    for (let i = 0; i < len && start + i < totalSamples; i++) {
      const t = i / sampleRate;
      const env =
        Math.min(1, i / attack) *
        Math.exp(-t * (seg.durationMs < 120 ? 28 : 12));
      const fundamental = Math.sin(2 * Math.PI * seg.freq * t);
      const harmonic = Math.sin(2 * Math.PI * seg.freq * 2 * t) * 0.35;
      samples[start + i] += (fundamental + harmonic) * gain * env;
    }
  }

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped * 32767, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const url = `data:audio/wav;base64,${btoa(binary)}`;
  nativeUrlCache.set(cacheKey, url);
  return url;
}

function nativeUrlForCue(cue: TimerCue): string {
  switch (cue) {
    case "work-countdown":
      return encodeWavDataUrl([{ freq: 1200, startMs: 0, durationMs: 140, gain: 1 }], 160);
    case "rest-countdown":
      return encodeWavDataUrl(
        [
          { freq: 520, startMs: 0, durationMs: 130, gain: 1 },
          { freq: 480, startMs: 140, durationMs: 130, gain: 1 },
        ],
        300
      );
    case "prep-countdown":
      return encodeWavDataUrl(
        [
          { freq: 880, startMs: 0, durationMs: 120, gain: 1 },
          { freq: 1100, startMs: 130, durationMs: 120, gain: 1 },
        ],
        280
      );
    case "set-complete":
      return encodeWavDataUrl(
        [
          { freq: 523, startMs: 0, durationMs: 180, gain: 1 },
          { freq: 784, startMs: 100, durationMs: 200, gain: 1 },
          { freq: 1046, startMs: 200, durationMs: 280, gain: 1 },
        ],
        520
      );
    case "rest-complete":
      return encodeWavDataUrl(
        [
          { freq: 587, startMs: 0, durationMs: 150, gain: 1 },
          { freq: 880, startMs: 160, durationMs: 150, gain: 1 },
          { freq: 1174, startMs: 320, durationMs: 180, gain: 1 },
        ],
        520
      );
    case "workout-complete":
      return encodeWavDataUrl(
        [
          { freq: 392, startMs: 0, durationMs: 120, gain: 1 },
          { freq: 523, startMs: 90, durationMs: 120, gain: 1 },
          { freq: 659, startMs: 180, durationMs: 120, gain: 1 },
          { freq: 784, startMs: 270, durationMs: 120, gain: 1 },
          { freq: 1046, startMs: 360, durationMs: 200, gain: 1 },
        ],
        600
      );
  }
}

function prewarmNativeCue(cue: TimerCue): void {
  if (nativeAudioPool.has(cue)) return;
  const audio = new Audio(nativeUrlForCue(cue));
  audio.volume = 1;
  audio.preload = "auto";
  nativeAudioPool.set(cue, audio);
  void audio.load();
}

function playNativeCue(cue: TimerCue): void {
  prewarmNativeCue(cue);
  const pooled = nativeAudioPool.get(cue);
  const audio = pooled ?? new Audio(nativeUrlForCue(cue));
  audio.volume = 1;
  audio.currentTime = 0;
  const playPromise = audio.play();
  if (playPromise) {
    void playPromise.catch(() => {
      /* autoplay policy — user already started timer */
    });
  }
}

function prewarmAllNativeCues(): void {
  const cues: TimerCue[] = [
    "work-countdown",
    "rest-countdown",
    "prep-countdown",
    "set-complete",
    "rest-complete",
    "workout-complete",
  ];
  cues.forEach(prewarmNativeCue);
}

export async function primeTimerAudio(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    prewarmAllNativeCues();
  }
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

export function playTimerCue(cue: TimerCue): void {
  if (Capacitor.isNativePlatform()) {
    playNativeCue(cue);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  void (async () => {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    playWebCue(ctx, cue);
  })();
}

/** @deprecated Usar playTimerCue("work-countdown"). */
export function playShortBeep(): void {
  playTimerCue("work-countdown");
}
