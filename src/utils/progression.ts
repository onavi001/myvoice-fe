import { IExercise } from "../models/Exercise";

/** Sugerencia simple de progresión según reps/series actuales. */
export function getProgressionHint(exercise: Partial<IExercise>): string | null {
  const sets = Number(exercise.sets) || 0;
  const reps = Number(exercise.reps) || 0;
  const unit = exercise.repsUnit === "seconds" ? "s" : "reps";

  if (sets <= 0 || reps <= 0) return null;

  if (exercise.completed) {
    if (unit === "s") {
      return `Próxima sesión: prueba +5–10 ${unit} por serie o +1 serie.`;
    }
    if (reps >= 12) {
      return "Próxima sesión: sube peso ~2,5–5% y vuelve a 8–10 reps.";
    }
    return `Próxima sesión: apunta a ${reps + 1}–2 ${unit} por serie o +2,5 kg.`;
  }

  if (unit === "s") {
    return `Objetivo hoy: ${sets}×${reps}${unit} con descanso controlado.`;
  }
  return `Objetivo hoy: ${sets}×${reps} ${unit}. Si sobra energía, +1 rep en la última serie.`;
}
