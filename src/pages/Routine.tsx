import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import { fetchRoutines } from "../store/routineSlice";
import RoutineSelector from "../components/routine/RoutineSelector";
import DayProgress from "../components/routine/DayProgress";
import ExerciseList from "../components/routine/ExerciseList";
import GenerateExerciseModal from "../components/routine/GenerateExerciseModal";
import useRoutineData from "../hooks/useRoutineData";
import useExerciseActions from "../hooks/useExerciseActions";
import Loader, { FuturisticLoader } from "../components/Loader";
import { ThunkError } from "../store/routineSlice";
import { IExercise } from "../models/Exercise";
import RoutineEmpty from "../components/routine/RoutineEmpty";

export default function RoutinePage() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { routines, loading: routinesLoading, error: routinesError } = useSelector((state: RootState) => state.routine);

  const { loading, error, selectedRoutine, selectedDay, selectedDayId, setSelectedDay, setSelectedDayId } =
    useRoutineData(routines);
  const { handleNewExercise, handleSelectExercise } = useExerciseActions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState<Partial<IExercise & { videoUrl: string }>[]>([]);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchRoutines());
    } else {
      navigate("/login");
    }
  }, [token, dispatch, navigate]);

  const onGenerateExercise = async (routineId: string, dayId: string, exerciseId: string) => {
    setLoadingGenerate(true);
    try {
      const exercises = await handleNewExercise(routineId, dayId, exerciseId);
      if (exercises) {
        setGeneratedExercises(exercises);
        setIsModalOpen(true);
      }
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      throw err;
    } finally {
      setLoadingGenerate(false);
    }
  };

  // Manejar errores globales
  if (routinesError || error) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
        Error: {routinesError || error}
      </div>
    );
  }

  // Mostrar mensaje si no hay rutinas
  if (!routines.length || !selectedRoutine || !selectedDay || !selectedDayId) {
    return <RoutineEmpty />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      {loadingGenerate && <FuturisticLoader />}
      {(userLoading || loading || routinesLoading) && <Loader />}
      <div className="p-4 max-w-full mx-auto flex-1">
        <RoutineSelector
          selectedDayId={selectedDayId}
          setSelectedDayId={setSelectedDayId}
          setSelectedDay={setSelectedDay}
        />
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