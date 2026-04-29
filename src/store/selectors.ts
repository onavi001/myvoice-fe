import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./index";

export const selectRoutineState = (state: RootState) => state.routine;
export const selectProgressState = (state: RootState) => state.progress;

export const selectRoutines = createSelector([selectRoutineState], (routine) => routine.routines);
export const selectSelectedRoutineId = createSelector([selectRoutineState], (routine) => routine.selectedRoutineId);
export const selectSelectedRoutine = createSelector(
  [selectRoutines, selectSelectedRoutineId],
  (routines, selectedRoutineId) => routines.find((routine) => routine._id === selectedRoutineId)
);

export const selectProgressEntries = createSelector([selectProgressState], (progress) => progress.progress);

export const selectRoutineExerciseOptions = createSelector([selectRoutines], (routines) => {
  const uniqueExercises = new Set<string>();
  routines.forEach((routine) => routine.days?.forEach((day) => day.exercises?.forEach((exercise) => uniqueExercises.add(exercise.name))));
  return ["", ...Array.from(uniqueExercises).sort()];
});

export const selectRoutineMuscleOptions = createSelector([selectRoutines], (routines) => {
  const uniqueMuscles = new Set<string>();
  routines.forEach((routine) => routine.days?.forEach((day) => day.musclesWorked?.forEach((muscle) => uniqueMuscles.add(muscle))));
  return ["", ...Array.from(uniqueMuscles).sort()];
});

