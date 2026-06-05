import {
  DEFAULT_TRAINING_PROFILE,
  mergeTrainingProfile,
  type TrainingProfile,
} from "../models/TrainingProfile";
import type { TrainingProfileFormValues } from "../components/training/TrainingProfileFields";

export type CoachRequestProfileForm = {
  bio: string;
  goals: string;
  notes: string;
  trainingProfile: TrainingProfileFormValues;
};

export type CoachRequestProfileField = keyof CoachRequestProfileForm | keyof TrainingProfileFormValues;

export type CoachRequestProfileErrors = Partial<Record<string, string>>;

const ALLOWED_DURATIONS = [30, 45, 60, 75, 90, 120, 150, 180];

export function validateCoachRequestProfile(form: CoachRequestProfileForm): CoachRequestProfileErrors {
  const errors: CoachRequestProfileErrors = {};

  if (form.bio.length > 500) {
    errors.bio = "La bio no puede exceder 500 caracteres";
  }

  const goalsArray = form.goals
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  if (goalsArray.length === 0) {
    errors.goals = "Indica al menos un objetivo para tu coach";
  } else if (goalsArray.length > 10) {
    errors.goals = "No puedes tener más de 10 objetivos";
  } else if (goalsArray.some((g) => g.length < 2 || g.length > 50)) {
    errors.goals = "Cada objetivo debe tener entre 2 y 50 caracteres";
  }

  if (form.notes.length > 500) {
    errors.notes = "Las notas no pueden exceder 500 caracteres";
  }

  const { heightCm, weightKg, sessionDurationMin } = form.trainingProfile;

  if (heightCm < 120 || heightCm > 230) {
    errors.heightCm = "La altura debe estar entre 120 y 230 cm";
  }
  if (weightKg < 30 || weightKg > 250) {
    errors.weightKg = "El peso debe estar entre 30 y 250 kg";
  }
  if (!ALLOWED_DURATIONS.includes(sessionDurationMin)) {
    errors.sessionDurationMin = "Selecciona una duración válida";
  }

  return errors;
}

export function profileFromUser(user: {
  bio?: string;
  goals?: string[];
  notes?: string;
}): Pick<CoachRequestProfileForm, "bio" | "goals" | "notes"> {
  return {
    bio: user.bio?.trim() ?? "",
    goals: user.goals?.join(", ") ?? "",
    notes: user.notes?.trim() ?? "",
  };
}

export function buildCoachRequestProfileForm(
  user: { bio?: string; goals?: string[]; notes?: string },
  savedTrainingProfile?: TrainingProfile | null
): CoachRequestProfileForm {
  return {
    ...profileFromUser(user),
    trainingProfile: mergeTrainingProfile(savedTrainingProfile ?? null),
  };
}

export function emptyCoachRequestProfileForm(): CoachRequestProfileForm {
  return {
    bio: "",
    goals: "",
    notes: "",
    trainingProfile: { ...DEFAULT_TRAINING_PROFILE },
  };
}
