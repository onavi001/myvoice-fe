import type { NavigateFunction } from "react-router-dom";
import type { ProgressAchievement } from "./progressAchievements";

export function navigateForAchievement(
  navigate: NavigateFunction,
  achievement: ProgressAchievement
): boolean {
  if (achievement.action?.kind === "navigate") {
    navigate(achievement.action.path);
    return true;
  }
  return false;
}

export function achievementActionLabel(achievement: ProgressAchievement): string | null {
  if (achievement.action?.kind !== "navigate") return null;
  if (achievement.id === "first_ai_routine") return "Ir a Rutina con IA";
  if (achievement.id === "first_routine") return "Crear mi rutina";
  return "Abrir";
}
