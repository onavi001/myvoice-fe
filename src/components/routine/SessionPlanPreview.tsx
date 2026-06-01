import type { RoutineAIFormData } from "./RoutineAIFormFields";
import { useSessionExercisePlan } from "../../hooks/useSessionExercisePlan";
import { BMI_CATEGORY_LABELS } from "../../models/SessionExercisePlan";

type Props = {
  formData: RoutineAIFormData;
};

export default function SessionPlanPreview({ formData }: Props) {
  const { plan, loading } = useSessionExercisePlan(formData);

  if (!plan && !loading) return null;

  const exerciseLabel = plan?.exercisesPerDay === 1 ? "ejercicio" : "ejercicios";

  return (
    <div
      className="rounded-xl border border-[#34C759]/30 bg-[#34C759]/10 p-4 space-y-2"
      aria-live="polite"
      aria-busy={loading}
    >
      {loading && !plan ? (
        <p className="text-sm text-[#AAA]">Calculando plan según tu perfil…</p>
      ) : plan ? (
        <>
          <p className="text-sm font-semibold text-[#34C759]">
            ~{plan.exercisesPerDay} {exerciseLabel} por día según tu perfil
          </p>
          <p className="text-xs text-[#AAA] leading-relaxed">
            Sesión de {formData.sessionDurationMin} min · IMC {plan.bmi} (
            {BMI_CATEGORY_LABELS[plan.bmiCategory]}) · ~
            {Math.round(plan.minutesPerExercise)} min por ejercicio
          </p>
          <p className="text-xs text-[#777] leading-relaxed">
            La IA usará esta estimación al generar tu rutina (objetivo {formData.goal},{" "}
            nivel {formData.level}).
          </p>
        </>
      ) : null}
    </div>
  );
}
