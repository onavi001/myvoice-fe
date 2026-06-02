import type { ProgressAchievement } from "./progressAchievements";
import type { FeaturedMedalSelection, UnlockTimestamps } from "./featuredMedalStorage";

const TIER_RANK: Record<ProgressAchievement["tier"], number> = {
  starter: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
};

/** Medalla desbloqueada más reciente (por fecha guardada al desbloquear). */
export function getMostRecentUnlockedAchievement(
  achievements: ProgressAchievement[],
  unlockMeta: UnlockTimestamps
): ProgressAchievement | null {
  const unlocked = achievements.filter((a) => a.unlocked);
  if (unlocked.length === 0) return null;

  return [...unlocked].sort((a, b) => {
    const ta = new Date(unlockMeta[a.id] ?? 0).getTime();
    const tb = new Date(unlockMeta[b.id] ?? 0).getTime();
    if (tb !== ta) return tb - ta;
    return TIER_RANK[b.tier] - TIER_RANK[a.tier];
  })[0];
}

/** Medalla de mayor nivel desbloqueada (fallback sin fechas). */
export function getHighestTierUnlocked(
  achievements: ProgressAchievement[]
): ProgressAchievement | null {
  const unlocked = achievements.filter((a) => a.unlocked);
  if (unlocked.length === 0) return null;
  return [...unlocked].sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier])[0];
}

export function resolveFeaturedAchievement(
  achievements: ProgressAchievement[],
  unlockMeta: UnlockTimestamps,
  saved: FeaturedMedalSelection | null,
  routineId: string
): ProgressAchievement | null {
  if (saved?.routineId === routineId && saved.achievementId) {
    const picked = achievements.find((a) => a.id === saved.achievementId);
    if (picked?.unlocked) return picked;
  }

  return (
    getMostRecentUnlockedAchievement(achievements, unlockMeta) ??
    getHighestTierUnlocked(achievements)
  );
}
