import { RoutineData } from "../../models/Routine";
import ExerciseCard from "./ExerciseCard";
import Card from "../Card";
import ModelWorkoutModal from "../ModelWorkoutModal";
import { EyeIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { IExercise } from "../../models/Exercise";

export default function ExerciseList({
  dayIndex,
  day,
  routineId,
  onGenerateExercise,
}: {
  dayIndex: number;
  day: RoutineData["days"][number];
  routineId: string;
  onGenerateExercise: (dayIndex: number, exerciseIndex: number) => void;
}) {
  const [openBodyModal, setOpenBodyModal] = useState(false);
  const [musclesToShow, setMusclesToShow] = useState<string[]>([]);

  const groupExercisesByCircuit = (exercises: IExercise[]) => {
    const circuits: { [key: string]: IExercise[] } = {};
    const standalone: IExercise[] = [];
    exercises.forEach((exercise) => {
      if (exercise.circuitId) {
        if (!circuits[exercise.circuitId]) circuits[exercise.circuitId] = [];
        circuits[exercise.circuitId].push(exercise);
      } else {
        standalone.push(exercise);
      }
    });
    return { circuits, standalone };
  };

  const { circuits, standalone } = groupExercisesByCircuit(day.exercises);

  return (
    <>
      <Card className="mb-4 max-h-24 overflow-y-auto scrollbar-hidden">
        <div className="mx-5 grid grid-cols-2 gap-1">
          <div className="items-center">
            <button
              onClick={() => {
                setOpenBodyModal(true);
                setMusclesToShow(day.musclesWorked);
              }}
              className="flex text-[#B0B0B0] font-semibold text-xs min-w-[100px]"
            >
              🏋️ Músculos: <EyeIcon className="w-4 h-4 ml-2" />
            </button>
            <ul className="list-disc pl-3 text-[#FFFFFF] text-xs max-w-full">
              <li>{day.musclesWorked.join(", ")}</li>
            </ul>
            {openBodyModal && (
              <ModelWorkoutModal
                musclesToShow={musclesToShow}
                isOpen={openBodyModal}
                onClose={() => setOpenBodyModal(false)}
              />
            )}
          </div>
          <div className="items-center">
            <span className="text-[#B0B0B0] font-semibold text-xs min-w-[100px]">🔥 Calentamiento:</span>
            <ul className="list-disc pl-3 text-[#FFFFFF] text-xs max-w-full">
              {day.warmupOptions.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {Object.entries(circuits).map(([circuitId, exercises]) => (
        <div key={`circuit-${circuitId}`} className="mb-4">
          <h3 className="text-sm font-semibold text-[#34C759] mb-2">Circuito: {circuitId}</h3>
          <ul className="space-y-2">
            {exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise._id.toString()}
                exercise={exercise}
                routineId={routineId}
                dayIndex={dayIndex}
                exerciseIndex={index}
                onGenerateExercise={onGenerateExercise}
              />
            ))}
          </ul>
        </div>
      ))}

      {standalone.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">Ejercicios Individuales</h3>
          <ul className="space-y-2">
            {standalone.map((exercise, index) => (
              <ExerciseCard
                key={exercise._id.toString()}
                exercise={exercise}
                routineId={routineId}
                dayIndex={dayIndex}
                exerciseIndex={index}
                onGenerateExercise={onGenerateExercise}
              />
            ))}
          </ul>
        </div>
      )}

      {day.explanation && (
        <p className="mt-3 text-[#B0B0B0] italic text-xs bg-[#2D2D2D] p-2 rounded shadow-sm">{day.explanation}</p>
      )}
    </>
  );
}