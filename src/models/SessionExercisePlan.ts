export type BmiCategory = "bajo_peso" | "normal" | "sobrepeso" | "obesidad";

export interface SessionExercisePlan {
  exercisesPerDay: number;
  bmi: number;
  bmiCategory: BmiCategory;
  minutesPerExercise: number;
  planRationale: string;
}

export const BMI_CATEGORY_LABELS: Record<BmiCategory, string> = {
  bajo_peso: "bajo peso",
  normal: "normal",
  sobrepeso: "sobrepeso",
  obesidad: "obesidad",
};
