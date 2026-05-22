import { RoutineData } from "../models/Routine";
import { calculateDayProgress } from "./calculateProgress";
import { SESSION_COMPLETE_THRESHOLD } from "./planStreak";

const WEEKDAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

function normalizeDayName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

/** Día sugerido para hoy: nombre de weekday, siguiente incompleto o primero. */
export function resolveSuggestedDay(routine: RoutineData): RoutineData["days"][number] | undefined {
  if (!routine.days.length) return undefined;

  const todayLabel = WEEKDAY_NAMES[new Date().getDay()];
  const todayNorm = normalizeDayName(todayLabel);

  const byWeekday = routine.days.find((d) => {
    const n = normalizeDayName(d.dayName || "");
    return n.includes(todayNorm) || todayNorm.includes(n);
  });
  if (byWeekday && calculateDayProgress(byWeekday) < SESSION_COMPLETE_THRESHOLD) {
    return byWeekday;
  }

  const incomplete = routine.days.find((d) => calculateDayProgress(d) < SESSION_COMPLETE_THRESHOLD);
  return incomplete ?? routine.days[0];
}

export function getTodayWorkoutMessage(routine: RoutineData): string {
  const day = resolveSuggestedDay(routine);
  if (!day) return "Sin días en la rutina";
  const pct = Math.round(calculateDayProgress(day));
  if (pct >= SESSION_COMPLETE_THRESHOLD) {
    return `${day.dayName} ya está completado. Elige otro día o descansa.`;
  }
  return `Hoy te toca: ${day.dayName}`;
}
