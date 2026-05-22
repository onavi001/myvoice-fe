import { SparklesIcon, PlayIcon } from "@heroicons/react/24/outline";
import { RoutineData } from "../../models/Routine";
import { getTodayWorkoutMessage, resolveSuggestedDay } from "../../utils/todayWorkout";
import { getNextPlannedDayLabel } from "../../utils/planStreak";
import Button from "../Button";

type Props = {
  routine: RoutineData;
  onSelectSuggestedDay: (day: RoutineData["days"][number]) => void;
  onStartWorkout: () => void;
};

export default function TodayWorkoutBanner({ routine, onSelectSuggestedDay, onStartWorkout }: Props) {
  const suggested = resolveSuggestedDay(routine);
  const message = getTodayWorkoutMessage(routine);
  const nextPlan = getNextPlannedDayLabel(routine);

  if (!suggested) return null;

  return (
    <section className="mb-4 rounded-xl border border-[#34C759]/40 bg-[#1a2e1f] p-4">
      <div className="flex items-start gap-3">
        <SparklesIcon className="w-6 h-6 text-[#34C759] shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#34C759]">¿Qué entreno hoy?</p>
          <p className="text-base text-white mt-1">{message}</p>
          <p className="text-xs text-[#888] mt-1">
            Siguiente en tu plan (racha): <span className="text-[#B0B0B0]">{nextPlan}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <Button
          onClick={() => {
            onSelectSuggestedDay(suggested);
            onStartWorkout();
          }}
          className="flex-1 min-h-12 rounded-xl flex items-center justify-center gap-2 font-semibold"
        >
          <PlayIcon className="w-5 h-5" />
          Empezar entrenamiento
        </Button>
        <Button
          variant="outline"
          onClick={() => onSelectSuggestedDay(suggested)}
          className="flex-1 min-h-12 rounded-xl text-sm"
        >
          Ir a {suggested.dayName}
        </Button>
      </div>
    </section>
  );
}
