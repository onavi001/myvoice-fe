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
  const { routines, loading: routinesLoading, error: routinesError } = useSelector((state: RootState) => state.routine);
  const { loading, error, selectedRoutine, selectedDay, selectedDayId, setSelectedDay, setSelectedDayId } = useRoutineData(routines);
  const { handleNewExercise, handleSelectExercise } = useExerciseActions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState<Partial<IExercise & { videoUrl: string }>[]>([]);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  useEffect(() => {
    if (token && !routinesLoading && routines.length === 0) {
      dispatch(fetchRoutines());
    } else if (!token) {
      navigate("/login");
    }
  }, [token, routines.length, routinesLoading, dispatch, navigate]);

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
    onGenerateExercise,
  };
}

