import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { EyeIcon, PlayCircleIcon } from "@heroicons/react/16/solid";
import { RootState } from "../../store";
import { IExercise } from "../../models/Exercise";
import { RoutineData } from "../../models/Routine";
import Button from "../Button";
import Input from "../Input";
import Textarea from "../Textarea";
import VideoPlayer from "./VideoPlayer";
import ModelWorkoutModal from "../ModelWorkoutModal";
import Loader, { SmallLoader } from "../Loader";
import Timer from "../Timer";
import useExerciseActions from "../../hooks/useExerciseActions";
import ExerciseSecondaryActions from "./ExerciseSecondaryActions";
import { getProgressionHint } from "../../utils/progression";
import { primeTimerAudio } from "../../utils/shortBeep";

type Props = {
  exercise: IExercise;
  routineId: string;
  dayId: string;
  day: RoutineData["days"][number];
  onGenerateExercise?: (routineId: string, dayId: string, exerciseId: string) => void;
};

export default function ExerciseWorkoutDetail({
  exercise,
  routineId,
  dayId,
  day,
  onGenerateExercise,
}: Props) {
  const exerciseId = exercise._id.toString();
  const { selectedRoutineId, routines } = useSelector((state: RootState) => state.routine);
  const { loadingVideos, handleSave, handleFetchVideos } = useExerciseActions();
  const [editData, setEditData] = useState<Partial<IExercise>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [openBodyModal, setOpenBodyModal] = useState(false);
  const [musclesToShow, setMusclesToShow] = useState<string[]>([]);
  const [editRoutine, setEditRoutine] = useState(false);
  const hasFetchedVideos = useRef(false);

  useEffect(() => {
    hasFetchedVideos.current = false;
    setEditData({});
    setIsTimerActive(false);
  }, [exerciseId]);

  useEffect(() => {
    if (selectedRoutineId) {
      const routine = routines.find((r) => r._id.toString() === selectedRoutineId);
      setEditRoutine(Boolean(routine?.couchId && routine.couchId !== routine?.userId));
    }
  }, [routines, selectedRoutineId]);

  useEffect(() => {
    if (
      !hasFetchedVideos.current &&
      (!exercise.videos || exercise.videos.length === 0)
    ) {
      handleFetchVideos(exercise.name, routineId, dayId, exerciseId)
        .then(() => {
          hasFetchedVideos.current = true;
        })
        .catch(() => {
          hasFetchedVideos.current = true;
        });
    }
  }, [exercise.name, exercise.videos, routineId, dayId, exerciseId, handleFetchVideos]);

  const currentExercise = { ...exercise, ...editData };
  const hint = getProgressionHint(currentExercise);

  const repsForTimer =
    currentExercise.repsUnit === "seconds" ? Number(currentExercise.reps) : NaN;
  const setDurationSeconds =
    currentExercise.repsUnit === "seconds" &&
    Number.isFinite(repsForTimer) &&
    repsForTimer > 0
      ? Math.floor(repsForTimer)
      : undefined;

  const handleInputChange = (field: keyof IExercise, value: string | number) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      await handleSave(routineId, dayId, exerciseId, editData);
      setEditData({});
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartTimer = () => {
    const sets = parseInt(String(currentExercise.sets || 0), 10);
    const restTime = parseInt(String(currentExercise.rest || 0), 10);
    if (Number.isNaN(sets) || sets <= 0 || Number.isNaN(restTime) || restTime <= 0) return;
    if (currentExercise.repsUnit === "seconds") {
      const repsAsSeconds = Number(currentExercise.reps);
      if (!Number.isFinite(repsAsSeconds) || repsAsSeconds <= 0) return;
    }
    void primeTimerAudio();
    setIsTimerActive(true);
  };

  const formatPrescription = () => {
    const unit = currentExercise.repsUnit === "seconds" ? "s" : " reps";
    const weight =
      currentExercise.weight > 0
        ? ` · ${currentExercise.weight} ${currentExercise.weightUnit || "kg"}`
        : "";
    return `${currentExercise.sets} × ${currentExercise.reps}${unit}${weight}`;
  };

  return (
    <>
      <div className="rounded-2xl border border-[#3C3C3C] bg-[#252525] overflow-hidden">
        <div className="p-4 border-b border-[#3C3C3C]">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{currentExercise.name}</h2>
          <p className="text-lg text-[#34C759] font-semibold tabular-nums mt-2">{formatPrescription()}</p>
          {currentExercise.rest ? (
            <p className="text-sm text-[#888] mt-1">Descanso: {currentExercise.rest}s entre series</p>
          ) : null}
          {hint ? (
            <p className="text-sm text-[#B0B0B0] mt-3 bg-[#1A1A1A] rounded-xl p-3 border border-[#3C3C3C]">
              {hint}
            </p>
          ) : null}
          {currentExercise.completed ? (
            <p className="mt-3 text-sm font-semibold text-[#34C759]">✓ Ejercicio completado</p>
          ) : null}
        </div>

        {(day.explanation?.trim() || (day.warmupOptions?.length ?? 0) > 0 || (day.musclesWorked?.length ?? 0) > 0) && (
          <div className="p-4 border-b border-[#3C3C3C] bg-[#1f1f1f] text-sm space-y-2">
            {day.explanation?.trim() ? (
              <p>
                <span className="text-[#888] font-semibold">Día: </span>
                <span className="text-[#E0E0E0]">{day.explanation}</span>
              </p>
            ) : null}
            {day.warmupOptions && day.warmupOptions.length > 0 ? (
              <div>
                <span className="text-[#888] font-semibold block mb-1">Calentamiento del día</span>
                <ul className="list-disc pl-4 text-[#E0E0E0]">
                  {day.warmupOptions.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {day.musclesWorked && day.musclesWorked.length > 0 ? (
              <p>
                <span className="text-[#888] font-semibold">Músculos del día: </span>
                {day.musclesWorked.join(", ")}
              </p>
            ) : null}
          </div>
        )}

        <div className="p-4 space-y-4 text-sm">
          <Button
            onClick={handleStartTimer}
            className="w-full flex items-center justify-center gap-2 bg-[#34C759] text-black min-h-12 rounded-xl font-semibold hover:bg-[#2ca44e] disabled:opacity-50"
            disabled={
              isTimerActive ||
              (currentExercise.repsUnit === "seconds" &&
                (!Number.isFinite(Number(currentExercise.reps)) || Number(currentExercise.reps) <= 0))
            }
          >
            <PlayCircleIcon className="w-5 h-5" />
            Iniciar ejercicio
          </Button>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => {
                  setOpenBodyModal(true);
                  setMusclesToShow(currentExercise.muscleGroup ?? []);
                }}
                className="flex items-center text-[#B0B0B0] font-semibold mb-1 touch-manipulation"
              >
                Músculo <EyeIcon className="w-4 h-4 ml-1 shrink-0" />
              </button>
              <p className="text-[#FFFFFF] break-words">
                {(currentExercise.muscleGroup ?? []).length > 0
                  ? currentExercise.muscleGroup.join(", ")
                  : "—"}
              </p>
            </div>

            {currentExercise.tips && currentExercise.tips.length > 0 ? (
              <div className="min-w-0">
                <span className="text-[#B0B0B0] font-semibold">Consejos</span>
                <ul className="list-disc pl-4 text-[#FFFFFF] mt-1 space-y-1">
                  {currentExercise.tips.map((tip, i) => (
                    <li key={i} className="break-words">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-end">
                <p className="text-[#666] text-xs">Sin consejos</p>
              </div>
            )}
          </div>

          {onGenerateExercise ? (
            <ExerciseSecondaryActions
              routineId={routineId}
              dayId={dayId}
              exerciseId={exerciseId}
              exerciseName={currentExercise.name}
              onRegenerateExercise={() => onGenerateExercise(routineId, dayId, exerciseId)}
              regenerateExerciseDisabled={editRoutine}
            />
          ) : null}
          {loadingVideos ? (
            <SmallLoader classNameLoader="py-6" />
          ) : (
            <VideoPlayer
              exercise={exercise}
              routineId={routineId}
              dayId={dayId}
              exerciseId={exerciseId}
            />
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[#B0B0B0] text-xs block mb-1">Series</label>
              <Input
                name="sets"
                type="number"
                value={currentExercise.sets ?? ""}
                onChange={(e) => handleInputChange("sets", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[#B0B0B0] text-xs block mb-1">Reps</label>
              <Input
                name="reps"
                type="number"
                value={currentExercise.reps ?? ""}
                onChange={(e) => handleInputChange("reps", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[#B0B0B0] text-xs block mb-1">Unidad reps</label>
              <select
                name="repsUnit"
                value={currentExercise.repsUnit || "count"}
                onChange={(e) => handleInputChange("repsUnit", e.target.value)}
                className="w-full min-h-11 bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-xl text-sm"
              >
                <option value="count">Unidades (U)</option>
                <option value="seconds">Segundos (S)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[#B0B0B0] text-xs block mb-1">Descanso</label>
              <Input
                name="rest"
                value={currentExercise.rest ?? ""}
                onChange={(e) => handleInputChange("rest", e.target.value)}
              />
            </div>
            <div>
              <label className="text-[#B0B0B0] text-xs block mb-1">Peso</label>
              <Input
                name="weight"
                type="number"
                value={currentExercise.weight ?? ""}
                onChange={(e) => handleInputChange("weight", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[#B0B0B0] text-xs block mb-1">Unidad peso</label>
              <select
                name="weightUnit"
                value={currentExercise.weightUnit || "kg"}
                onChange={(e) => handleInputChange("weightUnit", e.target.value)}
                className="w-full min-h-11 bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-xl text-sm"
              >
                <option value="kg">Kilos (kg)</option>
                <option value="lb">Libras (lb)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#B0B0B0] text-xs block mb-1">Notas</label>
            <Textarea
              name="notes"
              value={currentExercise.notes ?? ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[4.5rem] resize-y text-base"
            />
          </div>

          <Button
            onClick={() => void onSave()}
            className="w-full min-h-12 rounded-xl disabled:opacity-50"
            disabled={!Object.keys(editData).length || isSaving}
          >
            {isSaving ? (
              <>
                <Loader />
                Guardar cambios
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </div>

      {openBodyModal && (
        <ModelWorkoutModal
          musclesToShow={musclesToShow}
          isOpen={openBodyModal}
          onClose={() => setOpenBodyModal(false)}
        />
      )}

      {isTimerActive && (
        <Timer
          sets={parseInt(String(currentExercise.sets || 0), 10)}
          restTime={parseInt(String(currentExercise.rest || 0), 10)}
          setDurationSeconds={setDurationSeconds}
          isActive={isTimerActive}
          onComplete={() => setIsTimerActive(false)}
          onStop={() => setIsTimerActive(false)}
        />
      )}
    </>
  );
}
