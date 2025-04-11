import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { updateExercise, setExerciseVideos, updateExerciseCompleted } from "../store/routineSlice";
import { addProgress } from "../store/progressSlice";
import { ThunkError } from "../store/routineSlice";
import { IExercise } from "../models/Exercise";
import { fetchVideos } from "../utils/fetchVideos";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useExerciseActions() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { routines, selectedRoutineIndex } = useSelector((state: RootState) => state.routine);
  const { user } = useSelector((state: RootState) => state.user);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const handleSave = async (dayIndex: number, exerciseIndex: number, editData: Partial<IExercise>) => {
    if (!user || selectedRoutineIndex === null) return;
    const routine = routines[selectedRoutineIndex];
    const currentExercise = routine.days[dayIndex].exercises[exerciseIndex];
    try {
      await dispatch(
        updateExercise({
          routineId: routine._id,
          dayId: routine.days[dayIndex]._id,
          exerciseId: currentExercise._id,
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
            name: currentExercise.name,
            sets: Number(editData.sets ?? currentExercise.sets),
            reps: Number(editData.reps ?? currentExercise.reps),
            repsUnit: editData.repsUnit ?? currentExercise.repsUnit,
            weightUnit: editData.weightUnit ?? currentExercise.weightUnit,
            weight: editData.weight ?? currentExercise.weight ?? "",
            notes: editData.notes ?? currentExercise.notes ?? "",
            date: new Date(),
          })
        ).unwrap();
      }
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      throw err;
    }
  };

  const handleToggleCompleted = async (routineId: string, dayIndex: number, exerciseIndex: number) => {
    if (selectedRoutineIndex === null) return;
    const currentCompleted = routines[selectedRoutineIndex].days[dayIndex].exercises[exerciseIndex].completed;
    try {
      await dispatch(
        updateExerciseCompleted({ routineId, dayIndex, exerciseIndex, completed: !currentCompleted })
      ).unwrap();
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      throw err;
    }
  };

  const handleNewExercise = async (dayIndex: number, exerciseIndex: number) => {
    if (!user || selectedRoutineIndex === null) return null;
    const routine = routines[selectedRoutineIndex];
    const exercise = routine.days[dayIndex].exercises[exerciseIndex];
    try {
      const response = await fetch("/api/exercises/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayExercises: routine.days[dayIndex].exercises,
          exerciseToChangeId: exercise._id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Error generating exercises");
      return data as Partial<IExercise & { videoUrl: string }>[];
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      throw err;
    }
  };

  const handleSelectExercise = async (selectedExercise: Partial<IExercise & { videoUrl: string }>) => {
    if (!user || selectedRoutineIndex === null) return;
    const routine = routines[selectedRoutineIndex];
    const dayIndex = routine.days.findIndex((d) => d.exercises.some((e) => e._id === selectedExercise._id));
    const exerciseIndex = routine.days[dayIndex]?.exercises.findIndex((e) => e._id === selectedExercise._id) ?? -1;
    if (dayIndex === -1 || exerciseIndex === -1) return;
    try {
      await dispatch(
        updateExercise({
          routineId: routine._id,
          dayId: routine.days[dayIndex]._id,
          exerciseId: routine.days[dayIndex].exercises[exerciseIndex]._id,
          exerciseData: {
            name: selectedExercise.name,
            sets: selectedExercise.sets,
            reps: selectedExercise.reps,
            repsUnit: selectedExercise.repsUnit,
            weightUnit: selectedExercise.weightUnit,
            weight: selectedExercise.weight,
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
  
  const handleFetchVideos = async (exerciseName: string, routineIndex: number, dayIndex: number, exerciseIndex: number) => {
    setLoadingVideos(true);
    try {
      const exercise = routines[routineIndex].days[dayIndex].exercises[exerciseIndex];
      if (exercise.videos?.length > 0) return;
      const videos = await fetchVideos(exerciseName);
      await dispatch(
        setExerciseVideos({
          routineId: routines[routineIndex]._id.toString(),
          dayIndex,
          exerciseIndex,
          videos,
        })
      ).unwrap();
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      throw err;
    }finally{
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