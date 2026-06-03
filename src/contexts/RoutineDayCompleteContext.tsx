import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import RoutineCompleteCelebrate from "../components/routine/RoutineCompleteCelebrate";

export type RoutineDayCompletePayload = {
  dayName: string;
  exerciseCount: number;
};

type RoutineDayCompleteContextValue = {
  notifyDayComplete: (payload: RoutineDayCompletePayload) => void;
};

const RoutineDayCompleteContext = createContext<RoutineDayCompleteContextValue | null>(null);

export function RoutineDayCompleteProvider({ children }: { children: ReactNode }) {
  const [celebration, setCelebration] = useState<RoutineDayCompletePayload | null>(null);

  const notifyDayComplete = useCallback((payload: RoutineDayCompletePayload) => {
    setCelebration(payload);
  }, []);

  const dismiss = useCallback(() => setCelebration(null), []);

  const value = useMemo(() => ({ notifyDayComplete }), [notifyDayComplete]);

  return (
    <RoutineDayCompleteContext.Provider value={value}>
      {children}
      {celebration ? (
        <RoutineCompleteCelebrate
          dayName={celebration.dayName}
          exerciseCount={celebration.exerciseCount}
          onDismiss={dismiss}
        />
      ) : null}
    </RoutineDayCompleteContext.Provider>
  );
}

export function useRoutineDayCompleteNotify(): RoutineDayCompleteContextValue["notifyDayComplete"] | null {
  return useContext(RoutineDayCompleteContext)?.notifyDayComplete ?? null;
}
