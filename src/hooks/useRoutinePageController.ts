import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../store";
import { fetchRoutineById, fetchRoutines, ThunkError } from "../store/routineSlice";
import useRoutineData from "./useRoutineData";
import useExerciseActions from "./useExerciseActions";
import { IExercise } from "../models/Exercise";

const asId = (value: unknown) => String(value ?? "");

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
  const hydratedRoutineIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (routinesLoading) return;
    // Empty array after success is valid — do not refetch or we loop forever.
    if (routineStatus === "idle" || routineStatus === "failed") {
      dispatch(fetchRoutines());
    }
  }, [token, routineStatus, routinesLoading, dispatch, navigate]);

  useEffect(() => {
    if (!selectedRoutine || selectedRoutine.days.length === 0) return;

    const hasValidSelectedDay = selectedRoutine.days.some(
      (day) => asId(day._id) === asId(selectedDayId)
    );

    if (hasValidSelectedDay && selectedDay) return;

    const firstDay = selectedRoutine.days[0];
    setSelectedDay(firstDay);
    setSelectedDayId(asId(firstDay._id));
  }, [selectedRoutine, selectedDay, selectedDayId, setSelectedDay, setSelectedDayId]);

  useEffect(() => {
    if (!selectedRoutine) return;
    const routineId = asId(selectedRoutine._id);
    if (!routineId) return;
    if (hydratedRoutineIdsRef.current.has(routineId)) return;

    // Some list responses may include days but not fully populated exercises.
    const needsHydration = selectedRoutine.days.some((day) => {
      if (!Array.isArray(day.exercises)) return true;
      return day.exercises.some(
        (exercise) => typeof exercise !== "object" || exercise === null || !("_id" in exercise)
      );
    });

    if (!needsHydration) return;

    hydratedRoutineIdsRef.current.add(routineId);
    dispatch(fetchRoutineById(routineId)).catch(() => {
      hydratedRoutineIdsRef.current.delete(routineId);
    });
  }, [dispatch, selectedRoutine]);

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

