import { RoutineData } from "../models/Routine";

export function calculateDayProgress(day: RoutineData["days"][number]): number {
  const total = day.exercises.length;
  const completed = day.exercises.filter((ex) => ex.completed).length;
  return total > 0 ? (completed / total) * 100 : 0;
}

export function calculateWeekProgress(routine: RoutineData): number {
  const total = routine.days.reduce((sum, day) => sum + day.exercises.length, 0);
  const completed = routine.days.reduce((sum, day) => sum + day.exercises.filter((ex) => ex.completed).length, 0);
  return total > 0 ? (completed / total) * 100 : 0;
}