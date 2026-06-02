import { RoutineData } from "../models/Routine";
import { calculateDayProgress } from "./calculateProgress";

export const SESSION_COMPLETE_THRESHOLD = 80;

export type SessionCompletionEvent = {
  dayId: string;
  dayIndex: number;
  at: string;
};

export type PlanStreakState = {
  streak: number;
  /** Índice del próximo día del plan que cuenta para la racha */
  nextDayIndex: number;
  /** Semana ISO en la que ya se usó el día de gracia */
  graceWeekKey: string | null;
  /** IDs de días ya contados en la racha actual (evita doble conteo) */
  countedDayIds: string[];
  completionLog: SessionCompletionEvent[];
};

const storageKey = (routineId: string) => `mv_plan_streak_${routineId}`;

export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function loadPlanStreakState(routineId: string): PlanStreakState {
  try {
    const raw = localStorage.getItem(storageKey(routineId));
    if (!raw) {
      return { streak: 0, nextDayIndex: 0, graceWeekKey: null, countedDayIds: [], completionLog: [] };
    }
    const parsed = JSON.parse(raw) as PlanStreakState;
    return { ...parsed, completionLog: parsed.completionLog ?? [] };
  } catch {
    return { streak: 0, nextDayIndex: 0, graceWeekKey: null, countedDayIds: [], completionLog: [] };
  }
}

function savePlanStreakState(routineId: string, state: PlanStreakState) {
  localStorage.setItem(storageKey(routineId), JSON.stringify(state));
}

/** Registra una sesión completada (para rachas de días/semanas y contador semanal). */
function recordPlanSession(state: PlanStreakState, dayId: string, dayIndex: number): boolean {
  const today = localDateKey(new Date());
  const alreadyToday = state.completionLog.some(
    (e) => e.dayId === dayId && localDateKey(new Date(e.at)) === today
  );
  if (alreadyToday) return false;
  state.completionLog.push({ dayId, dayIndex, at: new Date().toISOString() });
  state.completionLog = state.completionLog.slice(-120);
  return true;
}

/** Sesiones del plan registradas como completadas en la semana calendario actual. */
export type ActivityStreaks = {
  /** Días de calendario consecutivos con al menos una sesión completada */
  dayStreak: number;
  /** Semanas ISO consecutivas con al menos una sesión completada */
  weekStreak: number;
  /** Días distintos con sesión (histórico en el log) */
  totalTrainingDays: number;
  /** Semanas distintas con sesión (histórico en el log) */
  totalTrainingWeeks: number;
};

function dayKeysFromLog(log: SessionCompletionEvent[], extraDayKeys: string[] = []): Set<string> {
  const days = new Set(log.map((e) => localDateKey(new Date(e.at))));
  for (const key of extraDayKeys) days.add(key);
  return days;
}

function weekKeysFromDayKeys(dayKeys: Set<string>): Set<string> {
  const weeks = new Set<string>();
  for (const dk of dayKeys) {
    weeks.add(isoWeekKey(new Date(`${dk}T12:00:00`)));
  }
  return weeks;
}

/** Racha de días seguidos (calendario). Cuenta hoy o, si hoy no hay sesión, desde ayer. */
export function computeCalendarDayStreak(
  log: SessionCompletionEvent[],
  now = new Date(),
  extraTrainingDayKeys: string[] = []
): number {
  const days = dayKeysFromLog(log, extraTrainingDayKeys);
  if (days.size === 0) return 0;

  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let key = localDateKey(cursor);
  if (!days.has(key)) {
    cursor = addDays(cursor, -1);
    key = localDateKey(cursor);
    if (!days.has(key)) return 0;
  }

  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Racha de semanas seguidas (calendario ISO). Cuenta esta semana o la anterior si aún no entrenaste esta semana. */
export function computeCalendarWeekStreak(
  log: SessionCompletionEvent[],
  now = new Date(),
  extraTrainingDayKeys: string[] = []
): number {
  const weeks = weekKeysFromDayKeys(dayKeysFromLog(log, extraTrainingDayKeys));
  if (weeks.size === 0) return 0;

  let cursor = new Date(now);
  let key = isoWeekKey(cursor);
  if (!weeks.has(key)) {
    cursor = addDays(cursor, -7);
    key = isoWeekKey(cursor);
    if (!weeks.has(key)) return 0;
  }

  let streak = 0;
  while (weeks.has(isoWeekKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

export function computeActivityStreaks(
  log: SessionCompletionEvent[],
  now = new Date(),
  extraTrainingDayKeys: string[] = []
): ActivityStreaks {
  const days = dayKeysFromLog(log, extraTrainingDayKeys);
  const weeks = weekKeysFromDayKeys(days);
  return {
    dayStreak: computeCalendarDayStreak(log, now, extraTrainingDayKeys),
    weekStreak: computeCalendarWeekStreak(log, now, extraTrainingDayKeys),
    totalTrainingDays: days.size,
    totalTrainingWeeks: weeks.size,
  };
}

export function countWeeklyPlanSessions(
  routine: RoutineData,
  log?: SessionCompletionEvent[]
): { done: number; total: number } {
  const total = routine.days.length;
  if (total === 0) return { done: 0, total: 0 };

  const week = isoWeekKey();
  const entries = log ?? loadPlanStreakState(routine._id.toString()).completionLog;
  const doneIds = new Set(
    entries.filter((e) => isoWeekKey(new Date(e.at)) === week).map((e) => e.dayId)
  );
  return { done: doneIds.size, total };
}

/**
 * Actualiza la racha cuando un día alcanza el umbral de completado.
 * La racha sigue el orden de días en la rutina (no el calendario L–D).
 */
export function updatePlanStreakOnSessionComplete(
  routine: RoutineData,
  dayId: string
): { streak: number; advanced: boolean; usedGrace: boolean } {
  const routineId = routine._id.toString();
  const dayIndex = routine.days.findIndex((d) => d._id.toString() === dayId);
  if (dayIndex < 0) return { streak: 0, advanced: false, usedGrace: false };

  const day = routine.days[dayIndex];
  if (calculateDayProgress(day) < SESSION_COMPLETE_THRESHOLD) {
    return { streak: loadPlanStreakState(routineId).streak, advanced: false, usedGrace: false };
  }

  const state = loadPlanStreakState(routineId);
  recordPlanSession(state, dayId, dayIndex);

  if (state.countedDayIds.includes(dayId)) {
    savePlanStreakState(routineId, state);
    return { streak: state.streak, advanced: false, usedGrace: false };
  }

  const n = routine.days.length;
  const weekKey = isoWeekKey();
  let usedGrace = false;

  if (dayIndex === state.nextDayIndex) {
    state.streak += 1;
    state.nextDayIndex = (dayIndex + 1) % n;
    state.graceWeekKey = null;
  } else {
    const behind = (dayIndex - state.nextDayIndex + n) % n;
    if (behind > 0 && state.graceWeekKey !== weekKey) {
      state.graceWeekKey = weekKey;
      usedGrace = true;
      state.streak += 1;
      state.nextDayIndex = (dayIndex + 1) % n;
    } else if (behind > 0) {
      state.streak = 1;
      state.nextDayIndex = (dayIndex + 1) % n;
      state.graceWeekKey = null;
    } else {
      state.countedDayIds.push(dayId);
      savePlanStreakState(routineId, state);
      return { streak: state.streak, advanced: false, usedGrace: false };
    }
  }

  state.countedDayIds.push(dayId);
  savePlanStreakState(routineId, state);
  return { streak: state.streak, advanced: true, usedGrace };
}

export function getNextPlannedDayLabel(routine: RoutineData): string {
  const state = loadPlanStreakState(routine._id.toString());
  const day = routine.days[state.nextDayIndex];
  return day?.dayName || `Día ${state.nextDayIndex + 1}`;
}

export function resetPlanStreak(routineId: string) {
  localStorage.removeItem(storageKey(routineId));
}
