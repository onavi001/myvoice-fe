import { ProgressData } from "../models/Progress";
import { RoutineData } from "../models/Routine";
import { calculateWeekProgress } from "./calculateProgress";
import { computeActivityStreaks } from "./planStreak";
import {
  buildCoachAchievementStats,
  buildProgressAchievements,
  type ProgressAchievement,
} from "./progressAchievements";
import {
  buildGlobalSessionLog,
  computePlanStreakFromProgress,
  countWeeklyPlanSessionsFromLog,
  filterProgressForRoutine,
  inferSessionEventsFromProgress,
} from "./progressSessions";

export type CoachClientDashboard = {
  dayStreak: number;
  weekStreak: number;
  planStreak: number;
  weekProgressPct: number;
  weekSessionsDone: number;
  weekSessionsTotal: number;
  lastSessionAt: string | null;
  recentMedals: ProgressAchievement[];
  unlockedMedalCount: number;
};

function pickPrimaryRoutine(routines: RoutineData[]): RoutineData | null {
  if (routines.length === 0) return null;
  const coachRoutine = routines.find((r) => r.couchId);
  return coachRoutine ?? routines[0];
}

function latestCompletedSession(progress: ProgressData[]): string | null {
  let latest: Date | null = null;
  for (const entry of progress) {
    if (!entry.completed) continue;
    const at = new Date(entry.date);
    if (!latest || at > latest) latest = at;
  }
  return latest ? latest.toISOString() : null;
}

export function buildCoachClientDashboard(
  progress: ProgressData[],
  routines: RoutineData[]
): CoachClientDashboard {
  const globalLog = buildGlobalSessionLog(progress, routines);
  const activityStreaks = computeActivityStreaks(globalLog);
  const primaryRoutine = pickPrimaryRoutine(routines);

  let planStreak = 0;
  let weekSessionsDone = 0;
  let weekSessionsTotal = 0;

  if (primaryRoutine) {
    planStreak = computePlanStreakFromProgress(primaryRoutine, progress);
    const scoped = filterProgressForRoutine(progress, primaryRoutine._id.toString());
    const inferred = inferSessionEventsFromProgress(scoped, primaryRoutine);
    const weekSessions = countWeeklyPlanSessionsFromLog(inferred, primaryRoutine);
    weekSessionsDone = weekSessions.done;
    weekSessionsTotal = weekSessions.total;
  }

  const weekProgressPct =
    routines.length > 0
      ? Math.round(
          routines.reduce((sum, routine) => sum + calculateWeekProgress(routine), 0) / routines.length
        )
      : 0;

  const stats = buildCoachAchievementStats(progress, routines);
  const achievements = buildProgressAchievements(stats);
  const unlocked = achievements.filter((a) => a.unlocked);
  const recentMedals = unlocked.slice(-3).reverse();

  return {
    dayStreak: activityStreaks.dayStreak,
    weekStreak: activityStreaks.weekStreak,
    planStreak,
    weekProgressPct,
    weekSessionsDone,
    weekSessionsTotal,
    lastSessionAt: latestCompletedSession(progress),
    recentMedals,
    unlockedMedalCount: unlocked.length,
  };
}

export function formatRelativeSessionLabel(daysSinceLastSession: number | null | undefined): string {
  if (daysSinceLastSession == null) return "Sin sesiones";
  if (daysSinceLastSession === 0) return "Entrenó hoy";
  if (daysSinceLastSession === 1) return "Ayer";
  return `Hace ${daysSinceLastSession} días`;
}
