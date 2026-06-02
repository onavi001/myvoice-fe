import { ProgressData } from "../models/Progress";
import { RoutineData } from "../models/Routine";
import { calculateWeekProgress } from "./calculateProgress";
import {
  computeActivityStreaks,
  countWeeklyPlanSessions,
  getNextPlannedDayLabel,
} from "./planStreak";
import {
  filterProgressForRoutine,
  normalizeId,
  syncPlanStreakWithProgress,
  trainingDateKeysFromProgress,
} from "./progressSessions";

export const PROGRESS_ROUTINE_STORAGE_KEY = "mv_progress_selected_routine";

export type PeriodPreset = "7d" | "30d" | "90d" | "all";

export type PersonalRecord = {
  exerciseName: string;
  weight: number;
  weightUnit: string;
  date: Date;
};

export type TrainingOverview = {
  routineId: string;
  routineName: string;
  /** Sesiones seguidas siguiendo el orden del plan */
  planStreak: number;
  dayStreak: number;
  weekStreak: number;
  totalTrainingDays: number;
  totalTrainingWeeks: number;
  nextDayLabel: string;
  weekSessionsDone: number;
  weekSessionsTotal: number;
  routineCompletionPct: number;
};

export function periodToDateRange(preset: PeriodPreset): { start?: Date; end?: Date } {
  if (preset === "all") return {};
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export function pickDefaultRoutineId(
  routines: RoutineData[],
  progress: ProgressData[] = []
): string | null {
  if (routines.length === 0) return null;
  if (progress.length === 0) return routines[0]._id.toString();

  const counts = new Map<string, number>();
  for (const entry of progress) {
    const id = normalizeId(entry.routineId);
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  let bestId = routines[0]._id.toString();
  let bestCount = -1;
  for (const routine of routines) {
    const id = routine._id.toString();
    const count = counts.get(id) ?? 0;
    if (count > bestCount) {
      bestCount = count;
      bestId = id;
    }
  }
  return bestId;
}

export function buildTrainingOverview(
  routine: RoutineData,
  allProgress: ProgressData[] = []
): TrainingOverview {
  const routineId = routine._id.toString();
  const routineProgress = filterProgressForRoutine(allProgress, routineId);
  const streakState = syncPlanStreakWithProgress(routine, routineProgress);
  const log = streakState.completionLog;
  const trainingDays = trainingDateKeysFromProgress(routineProgress, routineId);
  const activity = computeActivityStreaks(log, new Date(), trainingDays);
  const weekSessions = countWeeklyPlanSessions(routine, log);
  return {
    routineId,
    routineName: routine.name,
    planStreak: streakState.streak,
    dayStreak: activity.dayStreak,
    weekStreak: activity.weekStreak,
    totalTrainingDays: activity.totalTrainingDays,
    totalTrainingWeeks: activity.totalTrainingWeeks,
    nextDayLabel: getNextPlannedDayLabel(routine),
    weekSessionsDone: weekSessions.done,
    weekSessionsTotal: weekSessions.total,
    routineCompletionPct: Math.round(calculateWeekProgress(routine)),
  };
}

export function countEntriesInPeriod(
  progress: ProgressData[],
  start?: Date,
  end?: Date,
  routineId?: string
): number {
  const scoped = routineId ? filterProgressForRoutine(progress, routineId) : progress;
  return scoped.filter((entry) => {
    const d = new Date(entry.date);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  }).length;
}

export function countUniqueExercisesInPeriod(
  progress: ProgressData[],
  start?: Date,
  end?: Date,
  routineId?: string
): number {
  const scoped = routineId ? filterProgressForRoutine(progress, routineId) : progress;
  const names = new Set<string>();
  for (const entry of scoped) {
    const d = new Date(entry.date);
    if (start && d < start) continue;
    if (end && d > end) continue;
    if (entry.exerciseName.trim()) names.add(entry.exerciseName.trim());
  }
  return names.size;
}

export function computePersonalRecords(
  progress: ProgressData[],
  routineId?: string
): PersonalRecord[] {
  const scoped = routineId ? filterProgressForRoutine(progress, routineId) : progress;
  const bestByExercise = new Map<string, ProgressData>();
  for (const entry of scoped) {
    if (entry.weight <= 0 || entry.repsUnit === "seconds") continue;
    const key = entry.exerciseName.trim();
    if (!key) continue;
    const prev = bestByExercise.get(key);
    if (!prev || entry.weight > prev.weight) {
      bestByExercise.set(key, entry);
    }
  }
  return [...bestByExercise.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map((entry) => ({
      exerciseName: entry.exerciseName,
      weight: entry.weight,
      weightUnit: entry.weightUnit,
      date: new Date(entry.date),
    }));
}
