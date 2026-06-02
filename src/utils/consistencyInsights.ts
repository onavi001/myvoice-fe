import type { TrainingOverview } from "./progressOverview";
import type { ActivityStripDay } from "./progressInsights";

export type ConsistencyInsightTone = "positive" | "neutral" | "nudge";

export type ConsistencyInsight = {
  id: string;
  tone: ConsistencyInsightTone;
  message: string;
};

function daysSince(date: Date, now = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const then = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((start.getTime() - then.getTime()) / 86400000);
}

const MAX_INSIGHTS = 3;

/**
 * Mensajes cortos de constancia para móvil (plan semanal, rachas, actividad reciente).
 */
export function buildConsistencyInsights(
  overview: TrainingOverview,
  activityStrip: ActivityStripDay[],
  lastWorkoutDate: Date | null,
  now = new Date()
): ConsistencyInsight[] {
  const insights: ConsistencyInsight[] = [];
  const {
    weekSessionsDone,
    weekSessionsTotal,
    dayStreak,
    weekStreak,
    nextDayLabel,
  } = overview;
  const remaining = Math.max(0, weekSessionsTotal - weekSessionsDone);

  if (weekSessionsTotal > 0) {
    if (weekSessionsDone >= weekSessionsTotal) {
      insights.push({
        id: "week-complete",
        tone: "positive",
        message: `¡Semana del plan completa! ${weekSessionsDone}/${weekSessionsTotal} sesiones.`,
      });
    } else if (weekSessionsDone > 0) {
      const remainingPart =
        remaining === 1
          ? "Te falta 1 para cerrar la semana del plan."
          : remaining > 0
            ? `Te faltan ${remaining} para cerrar la semana del plan.`
            : "";
      insights.push({
        id: "week-progress",
        tone: remaining <= 1 ? "nudge" : "neutral",
        message: `Llevas ${weekSessionsDone} de ${weekSessionsTotal} sesiones esta semana.${remainingPart ? ` ${remainingPart}` : ""}`,
      });
    } else {
      insights.push({
        id: "week-start",
        tone: "nudge",
        message: `Puedes hacer hasta ${weekSessionsTotal} sesiones esta semana. Próximo: ${nextDayLabel}.`,
      });
    }
  }

  if (dayStreak >= 2) {
    insights.push({
      id: "day-streak",
      tone: "positive",
      message:
        dayStreak === 2
          ? "2 días seguidos con actividad. Buen ritmo."
          : `${dayStreak} días seguidos con actividad. Sigue así.`,
    });
  }

  if (weekStreak >= 2 && insights.length < MAX_INSIGHTS + 1) {
    insights.push({
      id: "week-streak",
      tone: "positive",
      message:
        weekStreak === 2
          ? "2 semanas seguidas entrenando."
          : `${weekStreak} semanas seguidas entrenando.`,
    });
  }

  const last7 = activityStrip.slice(-7);
  const trained7 = last7.filter((d) => d.trained).length;
  if (trained7 > 0 && insights.length < MAX_INSIGHTS + 2) {
    const target = Math.min(weekSessionsTotal || 3, 7);
    insights.push({
      id: "last-7",
      tone: trained7 >= target ? "positive" : "neutral",
      message: `En los últimos 7 días entrenaste ${trained7} ${trained7 === 1 ? "vez" : "veces"}.`,
    });
  }

  if (lastWorkoutDate) {
    const ago = daysSince(lastWorkoutDate, now);
    if (ago >= 3 && weekSessionsDone < weekSessionsTotal) {
      insights.push({
        id: "inactive",
        tone: "nudge",
        message: `Hace ${ago} días sin registro. Siguiente en el plan: ${nextDayLabel}.`,
      });
    }
  } else if (weekSessionsDone === 0) {
    insights.push({
      id: "no-history",
      tone: "nudge",
      message: "Marca ejercicios en tu rutina para ver tu constancia aquí.",
    });
  }

  const seen = new Set<string>();
  const deduped: ConsistencyInsight[] = [];
  for (const item of insights) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  const priority = ["week-complete", "week-progress", "inactive", "week-start", "day-streak", "week-streak", "last-7", "no-history"];
  deduped.sort((a, b) => priority.indexOf(a.id) - priority.indexOf(b.id));

  return deduped.slice(0, MAX_INSIGHTS);
}
