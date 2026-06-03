import { APP_NAME } from "../medalShare/constants";

export type RoutineShareContext = {
  dayName: string;
  exerciseCount: number;
};

export type RoutineShareCopy = {
  headline: string;
  /** Texto al compartir (mensaje completo) */
  celebrateFull: string;
  /** Texto en la imagen (más corto) */
  celebrateImage: string;
  dayLine: string;
  cta: string;
};

export function getRoutineShareCopy(ctx: RoutineShareContext): RoutineShareCopy {
  const exerciseLabel =
    ctx.exerciseCount === 1 ? "1 ejercicio" : `${ctx.exerciseCount} ejercicios`;

  return {
    headline: `Sesión completada · ${APP_NAME}`,
    celebrateFull: `🎉 ¡Terminé mi sesión de hoy en ${APP_NAME}!`,
    celebrateImage: "🎉 ¡Terminé mi sesión de hoy!",
    dayLine: `${ctx.dayName} · ${exerciseLabel}`,
    cta: "Felicidades por la constancia — ¿te unes al entreno?",
  };
}

export function buildRoutineShareText(ctx: RoutineShareContext): string {
  const copy = getRoutineShareCopy(ctx);
  return [copy.headline, copy.celebrateFull, "", copy.dayLine, "", copy.cta].join("\n");
}
