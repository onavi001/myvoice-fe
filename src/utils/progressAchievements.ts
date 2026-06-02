import { RoutineData } from "../models/Routine";
import { ProgressData } from "../models/Progress";
import { hasAiRoutineCreated } from "./achievementMilestones";
import { isoWeekKey, localDateKey, SessionCompletionEvent } from "./planStreak";
import { mergeSessionLogs, inferSessionEventsFromProgress } from "./progressSessions";
import { loadPlanStreakState } from "./planStreak";

export type AchievementTier = "starter" | "bronze" | "silver" | "gold" | "platinum";

export type AchievementAction =
  | { kind: "navigate"; path: "/routine-AI" | "/routine-form" }
  | { kind: "progress-medals" };

export type AchievementStats = {
  totalTrainingDays: number;
  perfectWeeksCount: number;
  maxWeekStreak: number;
  maxDayStreak: number;
  maxPlanStreak: number;
  hasAnyRoutine: boolean;
  hasAiRoutine: boolean;
};

export type ProgressAchievement = {
  id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  unlocked: boolean;
  action?: AchievementAction;
};

type AchievementDef = {
  id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  action?: AchievementAction;
  isUnlocked: (stats: AchievementStats) => boolean;
};

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_routine",
    title: "Mi primera rutina",
    description: "Creaste tu primera rutina en la app",
    tier: "starter",
    action: { kind: "navigate", path: "/routine-form" },
    isUnlocked: (s) => s.hasAnyRoutine,
  },
  {
    id: "first_ai_routine",
    title: "Rutina con IA",
    description: "Generaste o guardaste una rutina con inteligencia artificial",
    tier: "starter",
    action: { kind: "navigate", path: "/routine-AI" },
    isUnlocked: (s) => s.hasAiRoutine,
  },
  {
    id: "first_session",
    title: "Primer paso",
    description: "Registraste tu primer ejercicio",
    tier: "bronze",
    isUnlocked: (s) => s.totalTrainingDays >= 1,
  },
  {
    id: "first_perfect_week",
    title: "Primera semana",
    description: "Completaste todas las sesiones del plan en una semana",
    tier: "bronze",
    isUnlocked: (s) => s.perfectWeeksCount >= 1,
  },
  {
    id: "week_streak_2",
    title: "2 semanas",
    description: "2 semanas seguidas con actividad",
    tier: "silver",
    isUnlocked: (s) => s.maxWeekStreak >= 2,
  },
  {
    id: "week_streak_4",
    title: "4 semanas",
    description: "1 mes de constancia (4 semanas seguidas)",
    tier: "silver",
    isUnlocked: (s) => s.maxWeekStreak >= 4,
  },
  {
    id: "week_streak_8",
    title: "2 meses",
    description: "8 semanas seguidas entrenando",
    tier: "gold",
    isUnlocked: (s) => s.maxWeekStreak >= 8,
  },
  {
    id: "week_streak_16",
    title: "4 meses",
    description: "16 semanas seguidas entrenando",
    tier: "gold",
    isUnlocked: (s) => s.maxWeekStreak >= 16,
  },
  {
    id: "week_streak_26",
    title: "6 meses",
    description: "26 semanas seguidas entrenando",
    tier: "platinum",
    isUnlocked: (s) => s.maxWeekStreak >= 26,
  },
  {
    id: "day_streak_7",
    title: "7 días",
    description: "7 días seguidos con actividad",
    tier: "silver",
    isUnlocked: (s) => s.maxDayStreak >= 7,
  },
  {
    id: "days_30",
    title: "30 días",
    description: "30 días distintos con entreno registrado",
    tier: "gold",
    isUnlocked: (s) => s.totalTrainingDays >= 30,
  },
  {
    id: "perfect_weeks_4",
    title: "Plan x4",
    description: "4 semanas completando todo tu plan",
    tier: "gold",
    isUnlocked: (s) => s.perfectWeeksCount >= 4,
  },
  {
    id: "plan_streak_10",
    title: "Plan x10",
    description: "10 sesiones seguidas en orden del plan",
    tier: "platinum",
    isUnlocked: (s) => s.maxPlanStreak >= 10,
  },
];

function mondayOfWeek(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.getTime();
}

function weeksWithActivityFromLog(log: SessionCompletionEvent[]): { weekKey: string; monday: number }[] {
  const map = new Map<string, number>();
  for (const entry of log) {
    const at = new Date(entry.at);
    const wk = isoWeekKey(at);
    const monday = mondayOfWeek(at);
    const prev = map.get(wk);
    map.set(wk, prev == null ? monday : Math.min(prev, monday));
  }
  return [...map.entries()]
    .map(([weekKey, monday]) => ({ weekKey, monday }))
    .sort((a, b) => a.monday - b.monday);
}

/** Mayor racha histórica de semanas consecutivas con actividad. */
export function computeMaxCalendarWeekStreak(log: SessionCompletionEvent[]): number {
  const weeks = weeksWithActivityFromLog(log);
  if (weeks.length === 0) return 0;
  let max = 1;
  let current = 1;
  for (let i = 1; i < weeks.length; i++) {
    const gap = Math.round((weeks[i].monday - weeks[i - 1].monday) / (7 * 86400000));
    if (gap === 1) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }
  return max;
}

/** Mayor racha histórica de días consecutivos con actividad. */
export function computeMaxCalendarDayStreak(dayKeys: string[]): number {
  if (dayKeys.length === 0) return 0;
  const sorted = [...new Set(dayKeys)]
    .map((k) => new Date(`${k}T12:00:00`).getTime())
    .sort((a, b) => a - b);
  let max = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.round((sorted[i] - sorted[i - 1]) / 86400000);
    if (gap === 1) {
      current += 1;
      max = Math.max(max, current);
    } else if (gap > 1) {
      current = 1;
    }
  }
  return max;
}

export function countPerfectPlanWeeks(
  routine: RoutineData,
  log: SessionCompletionEvent[]
): number {
  const sessionsPerWeek = routine.days.length;
  if (sessionsPerWeek === 0) return 0;

  const byWeek = new Map<string, Set<string>>();
  for (const entry of log) {
    const wk = isoWeekKey(new Date(entry.at));
    if (!byWeek.has(wk)) byWeek.set(wk, new Set());
    byWeek.get(wk)!.add(entry.dayId);
  }

  let count = 0;
  for (const dayIds of byWeek.values()) {
    if (dayIds.size >= sessionsPerWeek) count += 1;
  }
  return count;
}

function replayMaxPlanStreak(routine: RoutineData, log: SessionCompletionEvent[]): number {
  const n = routine.days.length;
  if (n === 0 || log.length === 0) return 0;

  const sorted = [...log].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const seen = new Set<string>();
  let streak = 0;
  let max = 0;
  let nextDayIndex = 0;
  let graceWeekKey: string | null = null;
  const countedDayIds: string[] = [];

  for (const event of sorted) {
    const key = `${event.dayId}|${localDateKey(new Date(event.at))}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { dayId, dayIndex, at } = event;
    if (countedDayIds.includes(dayId)) continue;

    const weekKey = isoWeekKey(new Date(at));
    if (dayIndex === nextDayIndex) {
      streak += 1;
      nextDayIndex = (dayIndex + 1) % n;
      graceWeekKey = null;
    } else {
      const behind = (dayIndex - nextDayIndex + n) % n;
      if (behind > 0 && graceWeekKey !== weekKey) {
        graceWeekKey = weekKey;
        streak += 1;
        nextDayIndex = (dayIndex + 1) % n;
      } else if (behind > 0) {
        streak = 1;
        nextDayIndex = (dayIndex + 1) % n;
        graceWeekKey = null;
      } else {
        continue;
      }
    }
    countedDayIds.push(dayId);
    max = Math.max(max, streak);
  }

  const current = loadPlanStreakState(routine._id.toString()).streak;
  return Math.max(max, current);
}

export function buildAchievementStats(
  routine: RoutineData,
  routineProgress: ProgressData[],
  options?: { totalRoutines?: number }
): AchievementStats {
  const routineId = routine._id.toString();
  const local = loadPlanStreakState(routineId);
  const inferred = inferSessionEventsFromProgress(routineProgress, routine);
  const log = mergeSessionLogs(local.completionLog, inferred);

  const dayKeys = new Set<string>();
  for (const entry of log) {
    dayKeys.add(localDateKey(new Date(entry.at)));
  }
  for (const entry of routineProgress) {
    if (entry.completed) dayKeys.add(localDateKey(new Date(entry.date)));
  }

  const allDayKeys = [...dayKeys];

  const totalRoutines = options?.totalRoutines ?? 0;

  return {
    totalTrainingDays: allDayKeys.length,
    perfectWeeksCount: countPerfectPlanWeeks(routine, log),
    maxWeekStreak: computeMaxCalendarWeekStreak(log),
    maxDayStreak: computeMaxCalendarDayStreak(allDayKeys),
    maxPlanStreak: replayMaxPlanStreak(routine, log),
    hasAnyRoutine: totalRoutines >= 1,
    hasAiRoutine: hasAiRoutineCreated(),
  };
}

export function buildProgressAchievements(stats: AchievementStats): ProgressAchievement[] {
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    tier: def.tier,
    unlocked: def.isUnlocked(stats),
    action: def.action,
  }));
}
