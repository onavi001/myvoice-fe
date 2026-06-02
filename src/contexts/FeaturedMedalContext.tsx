import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchProgress } from "../store/progressSlice";
import { fetchRoutines } from "../store/routineSlice";
import {
  selectProgressEntries,
  selectRoutines,
} from "../store/selectors";
import {
  buildAchievementStats,
  buildProgressAchievements,
  type ProgressAchievement,
} from "../utils/progressAchievements";
import { filterProgressForRoutine } from "../utils/progressSessions";
import { pickDefaultRoutineId, PROGRESS_ROUTINE_STORAGE_KEY } from "../utils/progressOverview";
import {
  loadFeaturedMedal,
  saveFeaturedMedal,
  syncUnlockTimestamps,
} from "../utils/featuredMedalStorage";
import { resolveFeaturedAchievement } from "../utils/featuredMedalResolve";

type FeaturedMedalContextValue = {
  routineId: string | null;
  achievements: ProgressAchievement[];
  unlockedAchievements: ProgressAchievement[];
  featuredMedal: ProgressAchievement | null;
  setFeaturedMedalId: (achievementId: string) => void;
  isFeaturedInNavbar: (achievementId: string) => boolean;
};

const FeaturedMedalContext = createContext<FeaturedMedalContextValue | null>(null);

export function FeaturedMedalProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const progress = useSelector(selectProgressEntries);
  const routines = useSelector(selectRoutines);
  const { token } = useSelector((state: RootState) => state.user);
  const { status: progressStatus } = useSelector((state: RootState) => state.progress);
  const { status: routineStatus } = useSelector((state: RootState) => state.routine);
  const [featuredRevision, setFeaturedRevision] = useState(0);

  useEffect(() => {
    if (!token) return;
    if (routineStatus === "idle" || routineStatus === "failed") {
      void dispatch(fetchRoutines());
    }
    if (progressStatus === "idle" || progressStatus === "failed") {
      void dispatch(fetchProgress());
    }
  }, [token, routineStatus, progressStatus, dispatch]);

  const routineId = useMemo(() => {
    const fromProgressPage = localStorage.getItem(PROGRESS_ROUTINE_STORAGE_KEY);
    if (
      fromProgressPage &&
      routines.some((r) => r._id.toString() === fromProgressPage)
    ) {
      return fromProgressPage;
    }
    const saved = loadFeaturedMedal();
    if (saved?.routineId && routines.some((r) => r._id.toString() === saved.routineId)) {
      return saved.routineId;
    }
    return pickDefaultRoutineId(routines, progress);
  }, [routines, progress]);

  const achievements = useMemo(() => {
    if (!routineId) return [];
    const routine = routines.find((r) => r._id.toString() === routineId);
    if (!routine) return [];
    const scoped = filterProgressForRoutine(progress, routineId);
    const stats = buildAchievementStats(routine, scoped, {
      totalRoutines: routines.length,
    });
    return buildProgressAchievements(stats);
  }, [routineId, routines, progress]);

  const unlockMeta = useMemo(() => {
    if (!routineId) return {};
    const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id);
    return syncUnlockTimestamps(routineId, unlockedIds);
  }, [routineId, achievements]);

  const featuredMedal = useMemo(() => {
    if (!routineId || achievements.length === 0) return null;
    return resolveFeaturedAchievement(
      achievements,
      unlockMeta,
      loadFeaturedMedal(),
      routineId
    );
  }, [routineId, achievements, unlockMeta, featuredRevision]);

  const setFeaturedMedalId = useCallback(
    (achievementId: string) => {
      if (!routineId) return;
      const medal = achievements.find((a) => a.id === achievementId);
      if (!medal?.unlocked) return;
      saveFeaturedMedal({ routineId, achievementId });
      setFeaturedRevision((v) => v + 1);
    },
    [routineId, achievements]
  );

  const isFeaturedInNavbar = useCallback(
    (achievementId: string) => featuredMedal?.id === achievementId,
    [featuredMedal]
  );

  const unlockedAchievements = useMemo(
    () => achievements.filter((a) => a.unlocked),
    [achievements]
  );

  const value = useMemo(
    () => ({
      routineId,
      achievements,
      unlockedAchievements,
      featuredMedal,
      setFeaturedMedalId,
      isFeaturedInNavbar,
    }),
    [
      routineId,
      achievements,
      unlockedAchievements,
      featuredMedal,
      setFeaturedMedalId,
      isFeaturedInNavbar,
    ]
  );

  return (
    <FeaturedMedalContext.Provider value={value}>{children}</FeaturedMedalContext.Provider>
  );
}

export function useFeaturedMedal() {
  const ctx = useContext(FeaturedMedalContext);
  if (!ctx) {
    throw new Error("useFeaturedMedal must be used within FeaturedMedalProvider");
  }
  return ctx;
}

/** Safe en rutas sin provider (login). */
export function useFeaturedMedalOptional() {
  return useContext(FeaturedMedalContext);
}
