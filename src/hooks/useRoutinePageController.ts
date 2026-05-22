import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import { fetchRoutines, ThunkError } from "../store/routineSlice";
import useRoutineData from "./useRoutineData";
import useExerciseActions from "./useExerciseActions";
import { IExercise } from "../models/Exercise";

export function useRoutinePageController() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading: userLoading } = useSelector((state: RootState) => state.user);
  const {
    routines,
    loading: routinesLoading,
    error: routinesError,
    status: routineStatus,
  } = useSelector((state: RootState) => state.routine);
  const { loading, error, selectedRoutine, selectedDay, selectedDayId, setSelectedDay, setSelectedDayId } = useRoutineData();
  const { handleNewExercise, handleSelectExercise } = useExerciseActions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState<Partial<IExercise & { videoUrl: string }>[]>([]);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [exerciseToReplaceId, setExerciseToReplaceId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (routinesLoading) return;
    const shouldFetch =
      routineStatus === "idle" ||
      routineStatus === "failed" ||
      (routineStatus === "succeeded" && routines.length === 0);
    if (shouldFetch) {
      dispatch(fetchRoutines());
    }
  }, [token, routineStatus, routines.length, routinesLoading, dispatch, navigate]);

  const onGenerateExercise = async (routineId: string, dayId: string, exerciseId: string) => {
    setLoadingGenerate(true);
    setGenerateError(null);
    setExerciseToReplaceId(exerciseId);
    try {
      const exercises = await handleNewExercise(routineId, dayId, exerciseId);
      if (exercises && exercises.length > 0) {
        setGeneratedExercises(exercises);
        setIsModalOpen(true);
      } else {
        setGenerateError("No se encontraron alternativas para este ejercicio.");
      }
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
        return;
      }
      if (error.status === 402) {
        setGenerateError(error.message);
        return;
      }
      setGenerateError(
        error.message || "Error al generar alternativas. Comprueba tu conexión e inténtalo de nuevo."
      );
    } finally {
      setLoadingGenerate(false);
    }
  };

  const onSelectGeneratedExercise = async (
    selectedExercise: Partial<IExercise & { videoUrl: string }>
  ) => {
    if (!selectedRoutine || !selectedDayId || !exerciseToReplaceId) return;
    try {
      await handleSelectExercise(
        selectedRoutine._id.toString(),
        selectedDayId,
        exerciseToReplaceId,
        selectedExercise
      );
      setIsModalOpen(false);
      setGeneratedExercises([]);
      setExerciseToReplaceId(null);
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) navigate("/login");
      setGenerateError(error.message || "Error al aplicar el ejercicio");
    }
  };

  return {
    navigate,
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
    generateError,
    setGenerateError,
    onGenerateExercise,
    onSelectGeneratedExercise,
    exerciseToReplaceId,
  };
}

