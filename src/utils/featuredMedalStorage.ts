const FEATURED_KEY = "mv_featured_medal_v1";
const UNLOCKS_KEY = "mv_achievement_unlocks_v1";

export type FeaturedMedalSelection = {
  routineId: string;
  achievementId: string;
};

export type UnlockTimestamps = Record<string, string>;

export function loadFeaturedMedal(): FeaturedMedalSelection | null {
  try {
    const raw = localStorage.getItem(FEATURED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FeaturedMedalSelection;
    if (parsed?.routineId && parsed?.achievementId) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveFeaturedMedal(selection: FeaturedMedalSelection) {
  localStorage.setItem(FEATURED_KEY, JSON.stringify(selection));
}

export function loadAllUnlockTimestamps(): Record<string, UnlockTimestamps> {
  try {
    const raw = localStorage.getItem(UNLOCKS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, UnlockTimestamps>;
  } catch {
    return {};
  }
}

export function loadUnlockTimestamps(routineId: string): UnlockTimestamps {
  return loadAllUnlockTimestamps()[routineId] ?? {};
}

export function saveUnlockTimestamps(routineId: string, timestamps: UnlockTimestamps) {
  const all = loadAllUnlockTimestamps();
  all[routineId] = timestamps;
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify(all));
}

/** Registra fecha de desbloqueo para medallas recién obtenidas. */
export function syncUnlockTimestamps(
  routineId: string,
  unlockedIds: string[]
): UnlockTimestamps {
  const meta = loadUnlockTimestamps(routineId);
  const now = new Date().toISOString();
  let changed = false;

  for (const id of unlockedIds) {
    if (!meta[id]) {
      meta[id] = now;
      changed = true;
    }
  }

  if (changed) saveUnlockTimestamps(routineId, meta);
  return meta;
}
