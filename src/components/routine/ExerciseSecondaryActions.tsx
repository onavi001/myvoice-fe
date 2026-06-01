import { ArrowPathIcon } from "@heroicons/react/16/solid";
import Button from "../Button";
import RegenerateExerciseVideosButton from "./RegenerateExerciseVideosButton";
import { isNativeAndroid } from "../../services/ads/admobConfig";
import { isProUser } from "../../utils/freemium";

type Props = {
  routineId: string;
  dayId: string;
  exerciseId: string;
  exerciseName: string;
  onRegenerateExercise: () => void;
  regenerateExerciseDisabled?: boolean;
};

/** Fila de acciones secundarias (IA + videos) alineada para móvil. */
export default function ExerciseSecondaryActions({
  routineId,
  dayId,
  exerciseId,
  exerciseName,
  onRegenerateExercise,
  regenerateExerciseDisabled = false,
}: Props) {
  const showAdHint = isNativeAndroid() && !isProUser();

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-2 items-stretch">
        <Button
          type="button"
          onClick={onRegenerateExercise}
          disabled={regenerateExerciseDisabled}
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 bg-[#34C759] text-black px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#2ca44e] min-h-11 disabled:opacity-50 touch-manipulation"
          aria-label="Regenerar ejercicio con IA"
        >
          <ArrowPathIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">Regenerar ejercicio</span>
        </Button>
        <RegenerateExerciseVideosButton
          exerciseName={exerciseName}
          routineId={routineId}
          dayId={dayId}
          exerciseId={exerciseId}
          fullWidth
        />
      </div>
      {showAdHint ? (
        <p className="text-[10px] text-[#666] text-center leading-snug">
          Regenerar videos en Android puede mostrar un anuncio breve.
        </p>
      ) : null}
    </div>
  );
}
