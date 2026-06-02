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

/** Sesiones inferidas aunque la rutina ya no exista (solo historial de progreso). */
export function inferSessionEventsFromProgressOrHistory(
  progress: ProgressData[],
  routine?: RoutineData
): SessionCompletionEvent[] {
  if (routine && routine.days.length > 0) {
    return inferSessionEventsFromProgress(progress, routine);
  }

  const groups = new Map<
    string,
    { dayId: string; exerciseIds: Set<string>; latestAt: Date }
  >();

  for (const entry of progress) {
    if (!entry.completed) continue;
    const dayId = normalizeId(entry.dayId);
    if (!dayId) continue;
    const dateKey = localDateKey(new Date(entry.date));
    const key = `${dayId}|${dateKey}`;
    const at = new Date(entry.date);
    const existing = groups.get(key);
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
  const dayOrder = new Map<string, number>();
  for (const group of groups.values()) {
    const total = exerciseTotalForDay(group.dayId, progress);
    const ratio = total > 0 ? group.exerciseIds.size / total : group.exerciseIds.size > 0 ? 1 : 0;
    if (ratio * 100 < SESSION_COMPLETE_THRESHOLD) continue;

    if (!dayOrder.has(group.dayId)) {
      dayOrder.set(group.dayId, dayOrder.size);
    }

    events.push({
      dayId: group.dayId,
      dayIndex: dayOrder.get(group.dayId) ?? 0,
      at: group.latestAt.toISOString(),
    });
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function buildGlobalSessionLog(
  allProgress: ProgressData[],
  routines: RoutineData[]
): SessionCompletionEvent[] {
  const routineById = new Map(routines.map((r) => [r._id.toString(), r]));
  const routineIds = new Set<string>();
  for (const entry of allProgress) {
    const rid = normalizeId(entry.routineId);
    if (rid) routineIds.add(rid);
  }

  const events: SessionCompletionEvent[] = [];
  for (const rid of routineIds) {
    const scoped = filterProgressForRoutine(allProgress, rid);
    events.push(
      ...inferSessionEventsFromProgressOrHistory(scoped, routineById.get(rid))
    );
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

function historicalExerciseTotal(dayId: string, entries: ProgressData[]): number {
  const ids = new Set<string>();
  for (const e of entries) {
    if (!e.completed) continue;
    if (normalizeId(e.dayId) !== dayId) continue;
    const ex = normalizeId(e.exerciseId);
    if (ex) ids.add(ex);
  }
  return ids.size;
}

function exerciseTotalForDay(
  dayId: string,
  entries: ProgressData[],
  routine?: RoutineData
): number {
  if (routine) {
    const day = routine.days.find((d) => normalizeId(d._id) === dayId);
    if (day && day.exercises.length > 0) return day.exercises.length;
  }
  const historical = historicalExerciseTotal(dayId, entries);
  return historical > 0 ? historical : 1;
}

/** Días del plan: unión de historial + rutina actual (si existe). Sobrevive si borran la rutina. */
function planDayIdsForRoutine(entries: ProgressData[], routine?: RoutineData): string[] {
  const ids = new Set<string>();
  for (const e of entries) {
    const d = normalizeId(e.dayId);
    if (d) ids.add(d);
  }
  if (routine) {
    for (const d of routine.days) {
      const id = normalizeId(d._id);
      if (id) ids.add(id);
    }
  }
  return [...ids];
}

/**
 * Semanas perfectas de una rutina según historial (≥80% ejercicios por día, unión semanal).
 * No requiere que la rutina siga existiendo si `entries` tiene el historial guardado.
 */
export function countPerfectPlanWeeksForRoutineEntries(
  entries: ProgressData[],
  routine?: RoutineData
): number {
  const planDayIds = planDayIdsForRoutine(entries, routine);
  if (planDayIds.length === 0) return 0;

  const byWeekDay = new Map<string, Map<string, Set<string>>>();
  for (const entry of entries) {
    if (!entry.completed) continue;
    const dayId = normalizeId(entry.dayId);
    const exerciseId = normalizeId(entry.exerciseId);
    if (!dayId || !exerciseId || !planDayIds.includes(dayId)) continue;

    const week = isoWeekKey(new Date(entry.date));
    if (!byWeekDay.has(week)) byWeekDay.set(week, new Map());
    const weekMap = byWeekDay.get(week)!;
    if (!weekMap.has(dayId)) weekMap.set(dayId, new Set());
    weekMap.get(dayId)!.add(exerciseId);
  }

  let perfectWeeks = 0;
  for (const weekMap of byWeekDay.values()) {
    let completeDays = 0;
    for (const dayId of planDayIds) {
      const completedIds = weekMap.get(dayId);
      if (!completedIds) continue;

      let matched = completedIds.size;
      if (routine) {
        const day = routine.days.find((d) => normalizeId(d._id) === dayId);
        if (day && day.exercises.length > 0) {
          const routineExIds = new Set(
            day.exercises.map((ex) => normalizeId(ex._id)).filter(Boolean)
          );
          matched = 0;
          for (const id of completedIds) {
            if (routineExIds.has(id)) matched += 1;
          }
        }
      }

      const total = exerciseTotalForDay(dayId, entries, routine);
      if (total > 0 && (matched / total) * 100 >= SESSION_COMPLETE_THRESHOLD) {
        completeDays += 1;
      }
    }
    if (completeDays >= planDayIds.length) perfectWeeks += 1;
  }

  return perfectWeeks;
}

export function countPerfectPlanWeeksFromProgress(
  routine: RoutineData,
  progress: ProgressData[]
): number {
  const routineId = routine._id.toString();
  const scoped = filterProgressForRoutine(progress, routineId);
  return countPerfectPlanWeeksForRoutineEntries(scoped, routine);
}

/** Cuenta semanas perfectas en todo el historial (todas las rutinas, aunque estén borradas). */
export function countPerfectPlanWeeksGlobal(
  allProgress: ProgressData[],
  routines: RoutineData[] = []
): number {
  const routineById = new Map(routines.map((r) => [r._id.toString(), r]));
  const byRoutine = new Map<string, ProgressData[]>();

  for (const entry of allProgress) {
    if (!entry.completed) continue;
    const rid = normalizeId(entry.routineId);
    if (!rid) continue;
    if (!byRoutine.has(rid)) byRoutine.set(rid, []);
    byRoutine.get(rid)!.push(entry);
  }

  let total = 0;
  for (const [rid, entries] of byRoutine) {
    total += countPerfectPlanWeeksForRoutineEntries(entries, routineById.get(rid));
  }
  return total;
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
