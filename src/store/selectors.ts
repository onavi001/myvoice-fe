import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./index";

const toId = (value: unknown) => String(value ?? "");

export const selectRoutineState = (state: RootState) => state.routine;
export const selectProgressState = (state: RootState) => state.progress;

export const selectRoutines = createSelector([selectRoutineState], (routine) => routine.routines);

/** Plantillas del coach (sin couchId, propiedad del coach). */
export const selectCoachTemplates = createSelector(
  [selectRoutines, (state: RootState) => state.user.user],
  (routines, user) => {
    if (!user?._id) return routines.filter((routine) => !routine.couchId);
    return routines.filter(
      (routine) => !routine.couchId && toId(routine.userId) === toId(user._id)
    );
  }
);

/** Rutinas que el usuario entrena en /routine (coach: solo plantillas propias). */
export const selectPersonalRoutines = createSelector(
  [selectRoutines, selectCoachTemplates, (state: RootState) => state.user.user],
  (routines, coachTemplates, user) => (user?.role === "coach" ? coachTemplates : routines)
);

export const selectSelectedRoutineId = createSelector([selectRoutineState], (routine) => routine.selectedRoutineId);
export const selectSelectedRoutine = createSelector(
  [selectPersonalRoutines, selectSelectedRoutineId],
  (routines, selectedRoutineId) =>
    routines.find((routine) => toId(routine._id) === toId(selectedRoutineId))
);

export const selectProgressEntries = createSelector([selectProgressState], (progress) => progress.progress);

export const selectRoutineExerciseOptions = createSelector([selectPersonalRoutines], (routines) => {
  const uniqueExercises = new Set<string>();
  routines.forEach((routine) =>
    routine.days?.forEach((day) =>
      day.exercises?.forEach((exercise) => {
        if (exercise?.name) uniqueExercises.add(exercise.name);
      })
    )
  );
  return ["", ...Array.from(uniqueExercises).sort()];
});

export const selectRoutineMuscleOptions = createSelector([selectPersonalRoutines], (routines) => {
  const uniqueMuscles = new Set<string>();
  routines.forEach((routine) => routine.days?.forEach((day) => day.musclesWorked?.forEach((muscle) => uniqueMuscles.add(muscle))));
  return ["", ...Array.from(uniqueMuscles).sort()];
});

