import { ProgressData } from "../models/Progress";
import { RoutineData } from "../models/Routine";
import {
  isoWeekKey,
  localDateKey,
  loadPlanStreakState,
  SESSION_COMPLETE_THRESHOLD,
  SessionCompletionEvent,
  type PlanStreakState,
} from "./planStreak";

const storageKey = (routineId: string) => `mv_plan_streak_${routineId}`;

function savePlanStreakState(routineId: string, state: PlanStreakState) {
  localStorage.setItem(storageKey(routineId), JSON.stringify(state));
}

export function normalizeId(id: string | { toString(): string } | undefined): string {
  if (id == null) return "";
  return typeof id === "string" ? id : id.toString();
}

export function filterProgressForRoutine(
  progress: ProgressData[],
  routineId: string
): ProgressData[] {
  const rid = normalizeId(routineId);
  return progress.filter((e) => normalizeId(e.routineId) === rid);
}

/** Días de calendario con al menos un ejercicio registrado (historial del servidor). */
export function trainingDateKeysFromProgress(
  progress: ProgressData[],
  routineId: string
): string[] {
  const keys = new Set<string>();
  for (const entry of filterProgressForRoutine(progress, routineId)) {
    if (!entry.completed) continue;
    keys.add(localDateKey(new Date(entry.date)));
  }
  return [...keys];
}

function sessionLogKey(dayId: string, at: string): string {
  return `${dayId}|${localDateKey(new Date(at))}`;
}

/** Agrupa registros del historial en sesiones (día de rutina + fecha local). */
export function inferSessionEventsFromProgress(
  progress: ProgressData[],
  routine: RoutineData
): SessionCompletionEvent[] {
  const routineId = routine._id.toString();
  const groups = new Map<
    string,
    { dayId: string; exerciseIds: Set<string>; latestAt: Date }
  >();

  for (const entry of filterProgressForRoutine(progress, routineId)) {
    if (!entry.completed) continue;
    const dayId = normalizeId(entry.dayId);
    if (!dayId) continue;
    const dateKey = localDateKey(new Date(entry.date));
    const key = `${dayId}|${dateKey}`;
    const existing = groups.get(key);
    const at = new Date(entry.date);
    if (existing) {
      existing.exerciseIds.add(normalizeId(entry.exerciseId));
      if (at > existing.latestAt) existing.latestAt = at;
    } else {
      groups.set(key, {
        dayId,
        exerciseIds: new Set([normalizeId(entry.exerciseId)]),
        latestAt: at,
      });
    }
  }

  const events: SessionCompletionEvent[] = [];
  for (const group of groups.values()) {
    const day = routine.days.find((d) => normalizeId(d._id) === group.dayId);
    const total = day?.exercises.length ?? 0;
    const ratio = total > 0 ? group.exerciseIds.size / total : group.exerciseIds.size > 0 ? 1 : 0;
    if (ratio * 100 < SESSION_COMPLETE_THRESHOLD) continue;

    const dayIndex = routine.days.findIndex((d) => normalizeId(d._id) === group.dayId);
    if (dayIndex < 0) continue;

    events.push({
      dayId: group.dayId,
      dayIndex,
      at: group.latestAt.toISOString(),
    });
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function mergeSessionLogs(
  local: SessionCompletionEvent[],
  fromProgress: SessionCompletionEvent[]
): SessionCompletionEvent[] {
  const byKey = new Map<string, SessionCompletionEvent>();

  for (const e of [...local, ...fromProgress]) {
    const key = sessionLogKey(e.dayId, e.at);
    const prev = byKey.get(key);
    if (!prev || new Date(e.at) > new Date(prev.at)) {
      byKey.set(key, e);
    }
  }

  return [...byKey.values()].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

function applySessionToPlanStreakState(
  state: PlanStreakState,
  routine: RoutineData,
  event: SessionCompletionEvent
): void {
  const { dayId, dayIndex, at } = event;
  const n = routine.days.length;
  if (n === 0) return;

  const key = sessionLogKey(dayId, at);
  const alreadyInLog = state.completionLog.some((e) => sessionLogKey(e.dayId, e.at) === key);
  if (!alreadyInLog) {
    state.completionLog.push({ dayId, dayIndex, at });
    state.completionLog = state.completionLog.slice(-120);
  }

  if (state.countedDayIds.includes(dayId)) return;

  const weekKey = isoWeekKey(new Date(at));

  if (dayIndex === state.nextDayIndex) {
    state.streak += 1;
    state.nextDayIndex = (dayIndex + 1) % n;
    state.graceWeekKey = null;
  } else {
    const behind = (dayIndex - state.nextDayIndex + n) % n;
    if (behind > 0 && state.graceWeekKey !== weekKey) {
      state.graceWeekKey = weekKey;
      state.streak += 1;
      state.nextDayIndex = (dayIndex + 1) % n;
    } else if (behind > 0) {
      state.streak = 1;
      state.nextDayIndex = (dayIndex + 1) % n;
      state.graceWeekKey = null;
    } else {
      return;
    }
  }

  state.countedDayIds.push(dayId);
}

function replayPlanStreakFromLog(
  routine: RoutineData,
  log: SessionCompletionEvent[]
): PlanStreakState {
  const state: PlanStreakState = {
    streak: 0,
    nextDayIndex: 0,
    graceWeekKey: null,
    countedDayIds: [],
    completionLog: [],
  };

  const seen = new Set<string>();
  for (const event of log) {
    const dedupe = sessionLogKey(event.dayId, event.at);
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    applySessionToPlanStreakState(state, routine, event);
  }

  state.completionLog = log;
  return state;
}

/**
 * Combina historial del servidor con localStorage y persiste el log unificado.
 * Recalcula la racha del plan si estaba en 0 pero hay sesiones en el historial.
 */
export function syncPlanStreakWithProgress(
  routine: RoutineData,
  progress: ProgressData[]
): PlanStreakState {
  const routineId = routine._id.toString();
  const current = loadPlanStreakState(routineId);
  const inferred = inferSessionEventsFromProgress(progress, routine);
  const mergedLog = mergeSessionLogs(current.completionLog, inferred);

  const logChanged =
    mergedLog.length !== current.completionLog.length ||
    mergedLog.some((e, i) => current.completionLog[i]?.at !== e.at);

  if (!logChanged && current.streak > 0) {
    return current;
  }

  let next: PlanStreakState;

  if (current.streak === 0 && mergedLog.length > 0) {
    next = replayPlanStreakFromLog(routine, mergedLog);
  } else {
    next = { ...current, completionLog: mergedLog };
  }

  savePlanStreakState(routineId, next);
  return next;
}

export function countWeeklyPlanSessionsFromLog(
  log: SessionCompletionEvent[],
  routine: RoutineData
): { done: number; total: number } {
  const total = routine.days.length;
  if (total === 0) return { done: 0, total: 0 };
  const week = isoWeekKey();
  const doneIds = new Set(
    log.filter((e) => isoWeekKey(new Date(e.at)) === week).map((e) => e.dayId)
  );
  return { done: doneIds.size, total };
}
