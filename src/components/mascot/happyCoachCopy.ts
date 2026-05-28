export type HappyCoachMessageKey =
  | "emptyRoutine"
  | "todayWorkout"
  | "streak"
  | "workoutDayComplete"
  | "timerComplete"
  | "progressHint";

const copy: Record<HappyCoachMessageKey, string> = {
  emptyRoutine:
    "Aún no tienes rutina. Creemos una y empezamos con el pie derecho.",
  todayWorkout: "Hoy toca entrenar. Elige empezar cuando estés listo.",
  streak: "Buen ritmo. La constancia es lo que cuenta.",
  workoutDayComplete: "Sesión del día lista. Descansa y recupera bien.",
  timerComplete: "Series completadas. Buen trabajo.",
  progressHint: "Marca ejercicios hechos para registrar tu progreso y la racha.",
};

export function getHappyCoachMessage(
  key: HappyCoachMessageKey,
  params?: { streak?: number }
): string {
  if (key === "streak" && params?.streak != null && params.streak > 0) {
    return `Racha de ${params.streak} ${params.streak === 1 ? "sesión" : "sesiones"}. Sigue así.`;
  }
  return copy[key];
}
