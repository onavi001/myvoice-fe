/** Parse comma-separated list fields while the user is still typing. */
export function parseListFieldInput(value: string): string[] {
  if (!value) return [];
  return value.split(",").map((item, index) => (index === 0 ? item : item.replace(/^\s+/, "")));
}

export function formatListField(items: string[] | undefined | null): string {
  return (items ?? []).join(", ");
}

/** Trim and drop empty entries before persisting to the API. */
export function normalizeListField(items: string[] | undefined | null): string[] {
  return (items ?? []).map((item) => item.trim()).filter((item) => item.length > 0);
}

export function normalizeExerciseListFields<
  T extends { muscleGroup?: string[]; tips?: string[] },
>(exercise: T): T {
  return {
    ...exercise,
    muscleGroup: normalizeListField(exercise.muscleGroup),
    tips: normalizeListField(exercise.tips),
  };
}

export function normalizeDayListFields<
  T extends {
    musclesWorked?: string[];
    warmupOptions?: string[];
    exercises?: Array<{ muscleGroup?: string[]; tips?: string[] }>;
  },
>(day: T): T {
  return {
    ...day,
    musclesWorked: normalizeListField(day.musclesWorked),
    warmupOptions: normalizeListField(day.warmupOptions),
    exercises: (day.exercises ?? []).map((exercise) => normalizeExerciseListFields(exercise)),
  };
}
