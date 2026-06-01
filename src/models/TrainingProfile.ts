export type BiologicalSex = "masculino" | "femenino";

export interface TrainingProfile {
  biologicalSex: BiologicalSex;
  heightCm: number;
  weightKg: number;
  sessionDurationMin: number;
  updatedAt?: string;
}

export const DEFAULT_TRAINING_PROFILE: TrainingProfile = {
  biologicalSex: "masculino",
  heightCm: 170,
  weightKg: 70,
  sessionDurationMin: 60,
};

export function mergeTrainingProfile(
  saved: TrainingProfile | null | undefined
): TrainingProfile {
  if (!saved) return { ...DEFAULT_TRAINING_PROFILE };
  return {
    biologicalSex:
      saved.biologicalSex === "femenino" ? "femenino" : DEFAULT_TRAINING_PROFILE.biologicalSex,
    heightCm:
      typeof saved.heightCm === "number" && saved.heightCm > 0
        ? saved.heightCm
        : DEFAULT_TRAINING_PROFILE.heightCm,
    weightKg:
      typeof saved.weightKg === "number" && saved.weightKg > 0
        ? saved.weightKg
        : DEFAULT_TRAINING_PROFILE.weightKg,
    sessionDurationMin:
      typeof saved.sessionDurationMin === "number" && saved.sessionDurationMin > 0
        ? saved.sessionDurationMin
        : DEFAULT_TRAINING_PROFILE.sessionDurationMin,
    updatedAt: saved.updatedAt,
  };
}
