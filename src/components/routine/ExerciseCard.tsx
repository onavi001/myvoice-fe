import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { IExercise } from "../../models/Exercise";
import Card from "../Card";
import Input from "../Input";
import Textarea from "../Textarea";
import Button from "../Button";
import VideoPlayer from "./VideoPlayer";
import ModelWorkoutModal from "../ModelWorkoutModal";
import Loader, { SmallLoader } from "../Loader";
import { ArrowPathIcon, PlayCircleIcon, EyeIcon } from "@heroicons/react/16/solid";
import useExerciseActions from "../../hooks/useExerciseActions";
import Timer from "../Timer";

export default function ExerciseCard({
  exercise,
  routineId,
  dayIndex,
  exerciseIndex,
  onGenerateExercise,
}: {
  exercise: IExercise;
  routineId: string;
  dayIndex: number;
  exerciseIndex: number;
  onGenerateExercise: (dayIndex: number, exerciseIndex: number) => void;
}) {
  const { selectedRoutineIndex } = useSelector((state: RootState) => state.routine);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editData, setEditData] = useState<Partial<IExercise>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const { loadingVideos, handleSave, handleToggleCompleted, handleFetchVideos } = useExerciseActions();
  const [openBodyModal, setOpenBodyModal] = useState(false);
  const [musclesToShow, setMusclesToShow] = useState<string[]>([]);
  useEffect(() => {
    if (isExpanded && selectedRoutineIndex !== null) {
      handleFetchVideos(exercise.name, selectedRoutineIndex, dayIndex, exerciseIndex);
    }
  }, [exercise]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && selectedRoutineIndex !== null) {
      handleFetchVideos(exercise.name, selectedRoutineIndex, dayIndex, exerciseIndex);
    }
  };

  const handleInputChange = (field: keyof IExercise, value: string | number) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      await handleSave(dayIndex, exerciseIndex, editData);
      setEditData({});
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const onToggleCompleted = async () => {
    setIsToggling(true);
    try {
      await handleToggleCompleted(routineId.toString(), dayIndex, exerciseIndex);
    } finally {
      setIsToggling(false);
    }
  };

  const handleStartTimer = () => {
    const sets = parseInt(String(currentExercise.sets || 0), 10);
    const restTime = parseInt(String(currentExercise.rest || 0), 10);

    if (isNaN(sets) || sets <= 0 || isNaN(restTime) || restTime <= 0) {
      return;
    }

    setIsTimerActive(true);
  };

  const handleTimerComplete = () => {
    setIsTimerActive(false);
  };

  const handleTimerStop = () => {
    setIsTimerActive(false);
  };

  const currentExercise = { ...exercise, ...editData };

  return (
    <>
      <Card className="overflow-hidden">
        <button
          onClick={toggleExpand}
          className="w-full flex justify-between items-center p-2 text-left hover:bg-[#4A4A4A] transition-colors"
        >
          <div className="flex items-center">
            {isToggling ? (
              <Loader />
            ) : (
              <input
                type="checkbox"
                checked={currentExercise.completed || false}
                onChange={onToggleCompleted}
                onClick={(e) => e.stopPropagation()}
                className="mr-2 accent-[#34C759]"
              />
            )}
            <span className="text-sm font-semibold text-white truncate">{exercise.name}</span>
          </div>
          <span className="text-[#B0B0B0] text-xs">{isExpanded ? "▲" : "▼"}</span>
        </button>
        {isExpanded && (
          <div className="p-2 bg-[#4A4A4A] text-xs space-y-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleStartTimer}
                className="flex items-center bg-[#34C759] text-black rounded-full text-xs hover:bg-[#2ca44e] disabled:opacity-50"
                disabled={isTimerActive}
              >
                <span className="ml-1">Iniciar ejercicio</span>
                <PlayCircleIcon className="w-4 h-4 mx-2" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <button
                  onClick={() => {
                    setOpenBodyModal(true);
                    setMusclesToShow(exercise.muscleGroup);
                  }}
                  className="flex text-[#B0B0B0] font-semibold"
                >
                  Músculo: <EyeIcon className="w-4 h-4 ml-2" />
                </button>
                <p className="text-[#FFFFFF]">{currentExercise.muscleGroup.join(", ")}</p>
                <Button
                  onClick={() => onGenerateExercise(dayIndex, exerciseIndex)}
                  className="my-4 flex items-center gap-1 bg-[#34C759] text-black px-2 py-1 rounded-full text-xs hover:bg-[#2ca44e]"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Regenerar</span>
                </Button>
              </div>
              {currentExercise.tips?.length > 0 && (
                <div>
                  <span className="text-[#B0B0B0] font-semibold">Consejos:</span>
                  <ul className="list-disc pl-3 text-[#FFFFFF] max-w-full">
                    {currentExercise.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {loadingVideos ? (
              <SmallLoader />
            ) : (
              <VideoPlayer exercise={exercise} routineId={routineId.toString()} dayIndex={dayIndex} exerciseIndex={exerciseIndex} />
            )}
            <div className="grid grid-cols-3 gap-1">
              <div>
                <label className="text-[#B0B0B0]">Series:</label>
                <Input
                  name="sets"
                  type="number"
                  value={currentExercise.sets || ""}
                  onChange={(e) => handleInputChange("sets", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-[#B0B0B0]">Reps:</label>
                <Input
                  name="reps"
                  type="number"
                  value={currentExercise.reps || ""}
                  onChange={(e) => handleInputChange("reps", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-[#B0B0B0]">Unidad Reps:</label>
                <select
                  name="repsUnit"
                  value={currentExercise.repsUnit || "count"}
                  onChange={(e) => handleInputChange("repsUnit", e.target.value)}
                  className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-md text-xs"
                >
                  <option value="count">Unidades (U)</option>
                  <option value="seconds">Segundos (S)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div>
                <label className="text-[#B0B0B0]">Descanso:</label>
                <Input
                  name="rest"
                  value={currentExercise.rest || ""}
                  onChange={(e) => handleInputChange("rest", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-[#B0B0B0]">Peso:</label>
                <Input
                  name="weight"
                  value={currentExercise.weight || ""}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[#B0B0B0]">Unidad:</label>
                <select
                  name="weightUnit"
                  value={currentExercise.weightUnit || "kg"}
                  onChange={(e) => handleInputChange("weightUnit", e.target.value)}
                  className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-md text-xs"
                >
                  <option value="kg">Kilos (kg)</option>
                  <option value="lb">Libras (lb)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[#B0B0B0]">Notas:</label>
              <Textarea
                name="notes"
                value={currentExercise.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="h-8 resize-none"
              />
            </div>
            <Button
              onClick={onSave}
              className="w-full disabled:opacity-50"
              disabled={!Object.keys(editData).length || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader />
                  Guardar
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        )}
      </Card>
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
          onComplete={handleTimerComplete}
          onStop={handleTimerStop}
          isActive={isTimerActive}
        />
      )}
    </>
  );
}
