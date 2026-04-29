import RoutineSelector from "../components/routine/RoutineSelector";
import DayProgress from "../components/routine/DayProgress";
import ExerciseList from "../components/routine/ExerciseList";
import GenerateExerciseModal from "../components/routine/GenerateExerciseModal";
import Loader, { FuturisticLoader } from "../components/Loader";
import RoutineEmpty from "../components/routine/RoutineEmpty";
import WeeklyExerciseChart from "../components/WeeklyExerciseChart";
import WeeklyProgressCalendar from "../components/WeeklyProgressCalendar";
import { useRoutinePageController } from "../hooks/useRoutinePageController";

export default function RoutinePage() {
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
    handleSelectExercise,
    isModalOpen,
    setIsModalOpen,
    generatedExercises,
    loadingGenerate,
    onGenerateExercise,
  } = useRoutinePageController();

  // Manejar errores globales
  if (routinesError || error) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex items-center justify-center">
        Error: {routinesError || error}
      </div>
    );
  }

  // Mostrar mensaje si no hay rutinas
  if (!routines.length || !selectedRoutine || !selectedDay || !selectedDayId) {
    return <RoutineEmpty />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      {loadingGenerate && <FuturisticLoader />}
      {(userLoading || loading || routinesLoading) && <Loader />}
      <div className="p-3 sm:p-6 max-w-full mx-auto flex-1">
        <RoutineSelector
          selectedDayId={selectedDayId}
          setSelectedDayId={setSelectedDayId}
          setSelectedDay={setSelectedDay}
        />
        <WeeklyExerciseChart />
        <WeeklyProgressCalendar/>
        <DayProgress routine={selectedRoutine} day={selectedDay} dayId={selectedDayId} />
        <ExerciseList
          day={selectedDay}
          routineId={selectedRoutine._id.toString()}
          dayId={selectedDayId}
          onGenerateExercise={onGenerateExercise}
        />
      </div>
      <GenerateExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercises={generatedExercises}
        onSelect={(exercise) => handleSelectExercise(selectedRoutine._id.toString(), selectedDayId, exercise)}
      />
    </div>
  );
}