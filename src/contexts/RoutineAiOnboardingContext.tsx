import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchRoutines } from "../store/routineSlice";
import {
  isRoutineAiOnboardingDone,
  markRoutineAiOnboardingDone,
} from "../utils/onboarding";
import RoutineAiOnboardingOverlay from "../components/onboarding/RoutineAiOnboardingOverlay";

export type RoutineAiOnboardingStep =
  | "welcome"
  | "go-ai"
  | "fill-form"
  | "generate"
  | "save";

type RoutineAiOnboardingContextValue = {
  isActive: boolean;
  step: RoutineAiOnboardingStep | null;
  advance: () => void;
  skip: () => void;
  complete: () => void;
  setDraftReady: (ready: boolean) => void;
};

const RoutineAiOnboardingContext = createContext<RoutineAiOnboardingContextValue | null>(
  null
);

const STEP_ORDER: RoutineAiOnboardingStep[] = [
  "welcome",
  "go-ai",
  "fill-form",
  "generate",
  "save",
];

function nextStep(current: RoutineAiOnboardingStep): RoutineAiOnboardingStep | null {
  const idx = STEP_ORDER.indexOf(current);
  if (idx < 0 || idx >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[idx + 1];
}

export function RoutineAiOnboardingProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((state: RootState) => state.user);
  const { routines, status: routineStatus } = useSelector((state: RootState) => state.routine);
  const [step, setStep] = useState<RoutineAiOnboardingStep | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const userId = user?._id;

  const eligible =
    Boolean(token && userId) &&
    !dismissed &&
    !isRoutineAiOnboardingDone(userId) &&
    routines.length === 0;

  const isActive = eligible && step !== null;

  useEffect(() => {
    if (!token || !userId || isRoutineAiOnboardingDone(userId)) return;
    if (routineStatus === "idle" || routineStatus === "failed") {
      void dispatch(fetchRoutines());
    }
  }, [token, userId, routineStatus, dispatch]);

  useEffect(() => {
    if (!eligible || step !== null) return;
    setStep("welcome");
  }, [eligible, step]);

  useEffect(() => {
    if (!eligible || routines.length === 0) return;
    if (userId) markRoutineAiOnboardingDone(userId);
    setStep(null);
    setDismissed(true);
  }, [eligible, routines.length, userId]);

  useEffect(() => {
    if (!isActive || !step) return;
    if (location.pathname === "/routine-AI") {
      if (step === "welcome" || step === "go-ai") {
        setStep(draftReady ? "save" : "fill-form");
      }
    }
  }, [location.pathname, isActive, step, draftReady]);

  useEffect(() => {
    if (!isActive || !draftReady) return;
    if (step === "fill-form" || step === "generate") {
      setStep("save");
    }
  }, [draftReady, isActive, step]);

  const finish = useCallback(() => {
    if (userId) markRoutineAiOnboardingDone(userId);
    setDismissed(true);
    setStep(null);
    setDraftReady(false);
  }, [userId]);

  const advance = useCallback(() => {
    if (!step) return;
    const n = nextStep(step);
    if (!n) {
      finish();
      return;
    }
    if (n === "fill-form" && location.pathname !== "/routine-AI") {
      navigate("/routine-AI");
    }
    setStep(n);
  }, [step, finish, location.pathname, navigate]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const complete = useCallback(() => {
    finish();
  }, [finish]);

  const value = useMemo(
    () => ({
      isActive,
      step,
      advance,
      skip,
      complete,
      setDraftReady,
    }),
    [isActive, step, advance, skip, complete]
  );

  return (
    <RoutineAiOnboardingContext.Provider value={value}>
      {children}
      {isActive && step && (
        <RoutineAiOnboardingOverlay step={step} pathname={location.pathname} />
      )}
    </RoutineAiOnboardingContext.Provider>
  );
}

export function useRoutineAiOnboarding(): RoutineAiOnboardingContextValue {
  const ctx = useContext(RoutineAiOnboardingContext);
  if (!ctx) {
    return {
      isActive: false,
      step: null,
      advance: () => undefined,
      skip: () => undefined,
      complete: () => undefined,
      setDraftReady: () => undefined,
    };
  }
  return ctx;
}
