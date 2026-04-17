import Modal from "../Modal";
import Button from "../Button";
import { IExercise } from "../../models/Exercise";
import { useState } from "react";

export default function GenerateExerciseModal({
  isOpen,
  onClose,
  exercises,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  exercises: Partial<IExercise & { videoUrl: string }>[];
  onSelect: (exercise: Partial<IExercise & { videoUrl: string }>) => void;
}) {
  const [expandedVideos, setExpandedVideos] = useState<Record<number, boolean>>({});

  const toggleVideoExpansion = (index: number) => {
    setExpandedVideos((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-sm font-bold text-[#34C759] mb-2">Selecciona un nuevo ejercicio</h3>
      <div className="max-h-[400px] overflow-y-auto scrollbar-hidden">
        <ul className="space-y-4">
          {exercises.map((exercise, index) => {
            const isExpanded = expandedVideos[index] || false;
            return (
              <li key={index} className="p-2 bg-[#2D2D2D] rounded-md">
                <div
                  className="cursor-pointer hover:bg-[#3A3A3A] p-2 rounded-md"
                  onClick={() => toggleVideoExpansion(index)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white">
                      {exercise.name} - {exercise.sets}x{exercise.reps}{" "}
                      {exercise.weight ? `(${exercise.weight} ${exercise.weightUnit})` : ""}
                    </span>
                    <span className="text-[#D1D1D1] text-xs">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                  {isExpanded && (
                    <div className="mt-2">
                      <iframe
                        width="100%"
                        height="150"
                        src={exercise.videoUrl}
                        title={exercise.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => {onSelect(exercise); onClose();}}
                  className="mt-2 w-full bg-[#34C759] text-black px-2 py-1 rounded-md text-xs hover:bg-[#2ca44e]"
                >
                  Seleccionar
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}