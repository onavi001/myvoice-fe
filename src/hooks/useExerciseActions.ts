/**
 * Hook personalizado para manejar acciones sobre ejercicios:
 * - Guardar cambios
 * - Marcar ejercicios como completados
 * - Obtener videos relacionados
 *
 * Devuelve funciones para manipular ejercicios y estado de carga.
 */
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { updateExercise, setExerciseVideos, updateExerciseCompleted } from "../store/routineSlice";
import { addProgress } from "../store/progressSlice";
import { ThunkError } from "../store/routineSlice";
import { IExercise } from "../models/Exercise";
import { fetchVideos } from "../utils/fetchVideos";
import { apiClient } from "../utils/apiClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useExerciseActions() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { routines, selectedRoutineId } = useSelector((state: RootState) => state.routine);
  const { user, token } = useSelector((state: RootState) => state.user);
  
  const [loadingVideos, setLoadingVideos] = useState(false);

  const handleSave = async (routineId: string, dayId: string, exerciseId: string, editData: Partial<IExercise>) => {
    if (!user || !selectedRoutineId) return;
    const routine = routines.find((r) => r._id === routineId);
    if (!routine) return;
    const day = routine.days.find((d) => d._id === dayId);
    if (!day) return;
    const currentExercise = day.exercises.find((e) => e._id === exerciseId);
    if (!currentExercise) return;

    const validateEditData = (data: Partial<IExercise>) => {
      const errors: string[] = [];
      if (data.sets !== undefined && (isNaN(Number(data.sets)) || Number(data.sets) < 0)) {
        errors.push("Series debe ser un número válido");
      }
      if (data.reps !== undefined && (isNaN(Number(data.reps)) || Number(data.reps) < 0)) {
        errors.push("Repeticiones debe ser un número válido");
      }
      return errors;
    };

    const errors = validateEditData(editData);
    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    try {
      await dispatch(
        updateExercise({
          routineId,
          dayId,
          exerciseId,
          exerciseData: {
            sets: Number(editData.sets ?? currentExercise.sets),
            reps: Number(editData.reps ?? currentExercise.reps),
            repsUnit: editData.repsUnit ?? currentExercise.repsUnit,
            rest: editData.rest ?? currentExercise.rest,
            weightUnit: editData.weightUnit ?? currentExercise.weightUnit,
            weight: editData.weight ?? currentExercise.weight,
            notes: editData.notes ?? currentExercise.notes,
          },
        })
      ).unwrap();

      const validProgress = Object.keys(editData).filter((key) => key !== "rest");
      if (validProgress.length > 0) {
        await dispatch(
          addProgress({
            sets: Number(editData.sets ?? currentExercise.sets),
            reps: Number(editData.reps ?? currentExercise.reps),
            repsUnit: editData.repsUnit ?? currentExercise.repsUnit,
            weightUnit: editData.weightUnit ?? currentExercise.weightUnit,
            weight: editData.weight ?? currentExercise.weight ?? "",
            notes: editData.notes ?? currentExercise.notes ?? "",
            date: new Date(),
            completed: true,
            routineId: routineId,
            dayId: day._id,
            exerciseId: currentExercise._id,
            routineName: routine.name,
            dayName: day.dayName,
            exerciseName: currentExercise.name,
          })
        ).unwrap();
      }
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      throw err;
    }
  };

  const handleToggleCompleted = async (routineId: string, dayId: string, exerciseId: string) => {
    if (!selectedRoutineId) return;
    const routine = routines.find((r) => r._id === routineId);
    if (!routine) return;
    const day = routine.days.find((d) => d._id === dayId);
    if (!day) return;
    const currentExercise = day.exercises.find((e) => e._id === exerciseId);
    if (!currentExercise) return;

    try {
      await dispatch(
        updateExerciseCompleted({ routineId, dayId, exerciseId, completed: !currentExercise.completed })
      ).unwrap();
      await dispatch(
        addProgress({
          sets: currentExercise.sets,
          reps: currentExercise.reps,
          repsUnit: currentExercise.repsUnit,
          weightUnit: currentExercise.weightUnit,
          weight: currentExercise.weight,
          completed: true,
          notes: currentExercise.notes || "",
          routineId: routineId,
          routineName: routine.name,
          dayId: day._id,
          dayName: day.dayName,
          exerciseId: currentExercise._id,
          exerciseName: currentExercise.name,
          date: new Date(),
        })
      ).unwrap();
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      throw err;
    }
  };

  const handleNewExercise = async (routineId: string, dayId: string, exerciseId: string) => {
    if (!user || !selectedRoutineId) return null;
    const routine = routines.find((r) => r._id === routineId);
    if (!routine) return null;
    const day = routine.days.find((d) => d._id === dayId);
    if (!day) return null;
    const exercise = day.exercises.find((e) => e._id === exerciseId);
    if (!exercise) return null;

    try {
      return await apiClient<Partial<IExercise>[]>("/api/exercises/generate", {
        method: "POST",
        body: JSON.stringify({
          exerciseToChangeId: exerciseId,
          dayExercises: day.exercises.map((ex) => ({
            _id: ex._id,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            sets: ex.sets,
            reps: ex.reps,
          })),
        }),
      });
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) navigate("/login");
      throw err;
    }
  };

  const handleSelectExercise = async (
    routineId: string,
    dayId: string,
    exerciseIdToReplace: string,
    selectedExercise: Partial<IExercise & { videoUrl?: string }>
  ) => {
    if (!user || !selectedRoutineId) return;
    const routine = routines.find((r) => r._id === routineId);
    if (!routine) return;
    const day = routine.days.find((d) => d._id === dayId);
    if (!day) return;
    const exercise = day.exercises.find((e) => e._id === exerciseIdToReplace);
    if (!exercise) return;

    try {
      await dispatch(
        updateExercise({
          routineId,
          dayId,
          exerciseId: exerciseIdToReplace,
          exerciseData: {
            name: selectedExercise.name ?? exercise.name,
            sets: selectedExercise.sets ?? exercise.sets,
            reps: selectedExercise.reps ?? exercise.reps,
            repsUnit: selectedExercise.repsUnit ?? exercise.repsUnit,
            weightUnit: selectedExercise.weightUnit ?? exercise.weightUnit,
            weight: selectedExercise.weight ?? exercise.weight,
            rest: selectedExercise.rest ?? exercise.rest,
            tips: selectedExercise.tips ?? exercise.tips,
            muscleGroup: selectedExercise.muscleGroup ?? exercise.muscleGroup,
            videos: [],
          },
        })
      ).unwrap();
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      throw err;
    }
  };

  const handleFetchVideos = async (exerciseName: string, routineId: string, dayId: string, exerciseId: string) => {
    const routine = routines.find((r) => r._id === routineId);
    if (!routine) return;
    const day = routine.days.find((d) => d._id === dayId);
    if (!day) return;
    const exercise = day.exercises.find((e) => e._id === exerciseId);
    if (!exercise || exercise.videos?.length > 0) return;

    setLoadingVideos(true);
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const videos = await fetchVideos(exerciseName);
      await dispatch(
        setExerciseVideos({
          routineId,
          dayId,
          exerciseId,
          videos,
        })
      ).unwrap();
    } catch (err) {
      const error = err as ThunkError;
      console.error("Error fetching videos:", error);
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      }
      throw err;
    } finally {
      setLoadingVideos(false);
    }
  };

  return {
    loadingVideos,
    handleSave,
    handleToggleCompleted,
    handleNewExercise,
    handleSelectExercise,
    handleFetchVideos,
  };
}