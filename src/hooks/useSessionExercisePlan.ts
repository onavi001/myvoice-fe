import { useEffect, useRef, useState } from "react";
import type { RoutineAIFormData } from "../components/routine/RoutineAIFormFields";
import type { SessionExercisePlan } from "../models/SessionExercisePlan";
import { apiClient } from "../utils/apiClient";

type PlanInput = Pick<
  RoutineAIFormData,
  | "biologicalSex"
  | "heightCm"
  | "weightKg"
  | "sessionDurationMin"
  | "goal"
  | "level"
  | "equipment"
>;

export function useSessionExercisePlan(formData: PlanInput, enabled = true) {
  const [plan, setPlan] = useState<SessionExercisePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const requestSeq = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setPlan(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const seq = ++requestSeq.current;
      setLoading(true);
      void apiClient<SessionExercisePlan>("/api/routines/session-plan", {
        method: "POST",
        body: JSON.stringify({
          biologicalSex: formData.biologicalSex,
          heightCm: formData.heightCm,
          weightKg: formData.weightKg,
          sessionDurationMin: formData.sessionDurationMin,
          goal: formData.goal,
          level: formData.level,
          equipment: formData.equipment,
        }),
        signal: controller.signal,
      })
        .then((data) => {
          if (seq === requestSeq.current) setPlan(data);
        })
        .catch(() => {
          if (seq === requestSeq.current) setPlan(null);
        })
        .finally(() => {
          if (seq === requestSeq.current) setLoading(false);
        });
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    enabled,
    formData.biologicalSex,
    formData.heightCm,
    formData.weightKg,
    formData.sessionDurationMin,
    formData.goal,
    formData.level,
    formData.equipment,
  ]);

  return { plan, loading };
}
