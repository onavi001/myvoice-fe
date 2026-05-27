import RoutineSelector from "../components/routine/RoutineSelector";
import ExerciseList from "../components/routine/ExerciseList";
import GenerateExerciseModal from "../components/routine/GenerateExerciseModal";
import Loader, { FuturisticLoader } from "../components/Loader";
import RoutineEmpty from "../components/routine/RoutineEmpty";
import RoutineProgressSummary from "../components/routine/RoutineProgressSummary";
import RoutineExportActions from "../components/routine/RoutineExportActions";
import { useState } from "react";
import { useRoutinePageController } from "../hooks/useRoutinePageController";
import TodayWorkoutBanner from "../components/routine/TodayWorkoutBanner";
import WorkoutMode from "../components/routine/WorkoutMode";
import FreemiumGateModal from "../components/FreemiumGateModal";
import { canUseFeature, UsageFeature } from "../utils/freemium";
import WebAdBanner from "../components/ads/WebAdBanner";
import { isWebPlatform } from "../services/ads/admobConfig";

export default function RoutinePage() {
  const [workoutModeOpen, setWorkoutModeOpen] = useState(false);
  const [freemiumFeature, setFreemiumFeature] = useState<UsageFeature | null>(null);
  const {
    userLoading,
    routinesLoading,
    routinesError,
    routines,
    loading,
    error,
    selectedRoutine,
    selectedDay,
    selectedDayId,
    setSelectedDay,
    setSelectedDayId,
    isModalOpen,
    setIsModalOpen,
    generatedExercises,
    loadingGenerate,
    generateError,
    setGenerateError,
    onGenerateExercise,
    onSelectGeneratedExercise,
    exerciseToReplaceId,
  } = useRoutinePageController();

  // Manejar errores globales
  if (routinesError || error) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex items-center justify-center">
        Error: {routinesError || error}
      </div>
    );
  }

  if (routinesLoading && routines.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Mostrar mensaje si no hay rutinas
  if (!routines.length || !selectedRoutine || !selectedDay || !selectedDayId) {
    return <RoutineEmpty />;
  }

  const replacingExerciseName = selectedDay.exercises.find(
    (ex) => ex._id === exerciseToReplaceId
  )?.name;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      {loadingGenerate && <FuturisticLoader />}
      {generateError && (
        <div className="mx-3 sm:mx-6 mb-3 p-3 rounded-xl bg-[#3d2a2a] border border-[#EF5350] text-sm text-[#FF8A80]">
          {generateError}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setGenerateError(null)}
          >
            Cerrar
          </button>
        </div>
      )}
      {(userLoading || loading || routinesLoading) && <Loader />}
      <div className="p-3 sm:p-6 max-w-full mx-auto flex-1">
        <RoutineSelector
          selectedDayId={selectedDayId}
          setSelectedDayId={setSelectedDayId}
          setSelectedDay={setSelectedDay}
        />
        <TodayWorkoutBanner
          routine={selectedRoutine}
          onSelectSuggestedDay={(day) => {
            setSelectedDay(day);
            setSelectedDayId(day._id.toString());
          }}
          onStartWorkout={() => setWorkoutModeOpen(true)}
        />
        <RoutineExportActions routine={selectedRoutine} />
        <RoutineProgressSummary
          routine={selectedRoutine}
          day={selectedDay}
          dayId={selectedDayId}
        />
        <ExerciseList
          day={selectedDay}
          routineId={selectedRoutine._id.toString()}
          dayId={selectedDayId}
          onGenerateExercise={async (rid, did, eid) => {
            if (!canUseFeature("aiRegenerateExercise")) {
              setFreemiumFeature("aiRegenerateExercise");
              return;
            }
            await onGenerateExercise(rid, did, eid);
          }}
        />
        {isWebPlatform() && <WebAdBanner />}
      </div>
      <GenerateExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercises={generatedExercises}
        onSelect={onSelectGeneratedExercise}
        replacingExerciseName={replacingExerciseName}
      />
      {workoutModeOpen && (
        <WorkoutMode
          routine={selectedRoutine}
          day={selectedDay}
          dayId={selectedDayId}
          onClose={() => setWorkoutModeOpen(false)}
          onGenerateExercise={async (rid, did, eid) => {
            if (!canUseFeature("aiRegenerateExercise")) {
              setFreemiumFeature("aiRegenerateExercise");
              return;
            }
            setWorkoutModeOpen(false);
            await onGenerateExercise(rid, did, eid);
          }}
        />
      )}
      {freemiumFeature && (
        <FreemiumGateModal feature={freemiumFeature} onClose={() => setFreemiumFeature(null)} />
      )}
    </div>
  );
}