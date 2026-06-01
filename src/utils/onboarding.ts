const STORAGE_PREFIX = "mv_onboarding_ai_routine_v1";

export function routineAiOnboardingKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function isRoutineAiOnboardingDone(userId: string | undefined): boolean {
  if (!userId) return true;
  try {
    return localStorage.getItem(routineAiOnboardingKey(userId)) === "done";
  } catch {
    return true;
  }
}

export function markRoutineAiOnboardingDone(userId: string): void {
  try {
    localStorage.setItem(routineAiOnboardingKey(userId), "done");
  } catch {
    /* ignore quota / private mode */
  }
}
