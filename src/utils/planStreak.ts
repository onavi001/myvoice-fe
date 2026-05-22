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

function isoWeekKey(date = new Date()): string {
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

/** Sesiones del plan registradas como completadas en la semana calendario actual. */
export function countWeeklyPlanSessions(routine: RoutineData): { done: number; total: number } {
  const total = routine.days.length;
  if (total === 0) return { done: 0, total: 0 };

  const week = isoWeekKey();
  const state = loadPlanStreakState(routine._id.toString());
  const doneIds = new Set(
    state.completionLog.filter((e) => isoWeekKey(new Date(e.at)) === week).map((e) => e.dayId)
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
  if (state.countedDayIds.includes(dayId)) {
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
  state.completionLog.push({
    dayId,
    dayIndex,
    at: new Date().toISOString(),
  });
  state.completionLog = state.completionLog.slice(-80);
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
