import { useState } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { RoutineData } from "../../models/Routine";
import ExerciseWorkoutDetail from "./ExerciseWorkoutDetail";
import Button from "../Button";
import useExerciseActions from "../../hooks/useExerciseActions";

type Props = {
  routine: RoutineData;
  day: RoutineData["days"][number];
  dayId: string;
  onClose: () => void;
  onGenerateExercise?: (routineId: string, dayId: string, exerciseId: string) => void;
};

export default function WorkoutMode({ routine, day, dayId, onClose, onGenerateExercise }: Props) {
  const routineId = routine._id.toString();
  const exercises = day.exercises ?? [];
  const [index, setIndex] = useState(0);
  const [toggling, setToggling] = useState(false);
  const { handleToggleCompleted } = useExerciseActions();

  const current = exercises[index];
  const completedCount = exercises.filter((e) => e.completed).length;
  const pct = exercises.length ? Math.round((completedCount / exercises.length) * 100) : 0;

  const goNext = () => setIndex((i) => Math.min(i + 1, exercises.length - 1));
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));

  const markDone = async () => {
    if (!current || current.completed || toggling) return;
    setToggling(true);
    try {
      await handleToggleCompleted(routineId, dayId, current._id.toString());
    } finally {
      setToggling(false);
    }
  };

  if (!current) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <p className="text-[#888]">No hay ejercicios en este día.</p>
        <Button onClick={onClose} className="mt-4">
          Cerrar
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#0A0A0A] text-[#E0E0E0] flex flex-col">
      <header className="shrink-0 flex items-center justify-between p-4 border-b border-[#3C3C3C] bg-[#0A0A0A]">
        <div className="min-w-0">
          <p className="text-xs text-[#34C759] font-semibold uppercase tracking-wide">Modo entrenamiento</p>
          <h1 className="text-lg font-bold truncate">{day.dayName}</h1>
          <p className="text-xs text-[#888] tabular-nums">
            Ejercicio {index + 1}/{exercises.length} · {completedCount} hechos · {pct}%
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-[#252525] border border-[#3C3C3C] touch-manipulation"
          aria-label="Salir"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-28">
        <ExerciseWorkoutDetail
          key={current._id.toString()}
          exercise={current}
          routineId={routineId}
          dayId={dayId}
          day={day}
          onGenerateExercise={onGenerateExercise}
        />
      </main>

      <footer className="shrink-0 fixed bottom-0 left-0 right-0 z-[61] p-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#0A0A0A]/95 border-t border-[#3C3C3C] backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          {!current.completed && (
            <Button
              onClick={() => void markDone()}
              disabled={toggling}
              className="w-full min-h-14 text-base font-bold rounded-xl"
            >
              {toggling ? "Guardando…" : "Marcar como hecho"}
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={index === 0}
              className="flex-1 min-h-12 rounded-xl flex items-center justify-center gap-1"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={goNext}
              disabled={index >= exercises.length - 1}
              className="flex-1 min-h-12 rounded-xl flex items-center justify-center gap-1"
            >
              Siguiente
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
