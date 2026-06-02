import { getUsageCount } from "./freemium";

const AI_ROUTINE_KEY = "mv_achievement_ai_routine_v1";

export function markAiRoutineCreated() {
  localStorage.setItem(AI_ROUTINE_KEY, "true");
}

export function hasAiRoutineCreated(): boolean {
  if (localStorage.getItem(AI_ROUTINE_KEY) === "true") return true;
  return getUsageCount("aiGenerate") > 0 || getUsageCount("aiImport") > 0;
}
