import { useEffect, useState } from "react";
import BottomSheet from "./BottomSheet";
import Button from "../Button";
import Textarea from "../Textarea";
import { SmallLoader } from "../Loader";
import TrainingProfileFields from "../training/TrainingProfileFields";
import type { TrainingProfileFormValues } from "../training/TrainingProfileFields";
import {
  type CoachRequestProfileForm,
  validateCoachRequestProfile,
} from "../../utils/coachRequestProfile";

type Props = {
  open: boolean;
  onClose: () => void;
  coachName?: string;
  initial: CoachRequestProfileForm;
  loadingInitial?: boolean;
  submitting: boolean;
  error?: string | null;
  onSubmit: (profile: CoachRequestProfileForm) => Promise<void>;
};

export default function CoachRequestProfileSheet({
  open,
  onClose,
  coachName,
  initial,
  loadingInitial = false,
  submitting,
  error,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CoachRequestProfileForm>(initial);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setFieldErrors({});
      setSubmitError(null);
    }
  }, [open, initial]);

  const handleTextChange = (name: "bio" | "goals" | "notes", value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const handleTrainingChange = (field: keyof TrainingProfileFormValues, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      trainingProfile: { ...prev.trainingProfile, [field]: value },
    }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    const errors = validateCoachRequestProfile(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo enviar la solicitud");
    }
  };

  const title = coachName ? `Solicitar a ${coachName}` : "Confirmar tu perfil";

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[#B0B0B0] mb-4 leading-relaxed">
        Tu coach verá esta información para personalizar tu entrenamiento. Revisa o completa los datos
        antes de enviar la solicitud.
      </p>

      {(error || submitError) && (
        <p className="text-sm text-[#FF8A80] mb-4" role="alert">
          {error || submitError}
        </p>
      )}

      {loadingInitial ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <SmallLoader />
          <p className="text-xs text-[#888]">Cargando tu perfil…</p>
        </div>
      ) : (
        <div className="space-y-5">
          <TrainingProfileFields
            value={form.trainingProfile}
            onChange={handleTrainingChange}
            errors={{
              heightCm: fieldErrors.heightCm,
              weightKg: fieldErrors.weightKg,
              sessionDurationMin: fieldErrors.sessionDurationMin,
            }}
            compact
          />

          <div>
            <label className="block text-sm font-medium text-[#E0E0E0] mb-1">Sobre ti</label>
            <Textarea
              name="bio"
              value={form.bio}
              onChange={(e) => handleTextChange("bio", e.target.value)}
              placeholder="Experiencia, lesiones, horarios…"
              className="w-full bg-[#252525] border border-[#3A3A3A] text-[#E0E0E0] placeholder-[#666] rounded-xl p-3 text-sm min-h-[5rem] focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A]"
            />
            {fieldErrors.bio && <p className="text-[#FF8A80] text-xs mt-1">{fieldErrors.bio}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
              Objetivos <span className="text-[#FF8A80]">*</span>
            </label>
            <Textarea
              name="goals"
              value={form.goals}
              onChange={(e) => handleTextChange("goals", e.target.value)}
              placeholder="Ej. ganar fuerza, perder grasa, mejorar movilidad"
              className="w-full bg-[#252525] border border-[#3A3A3A] text-[#E0E0E0] placeholder-[#666] rounded-xl p-3 text-sm min-h-[4rem] focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A]"
            />
            <p className="text-xs text-[#666] mt-1">Separa varios objetivos con comas.</p>
            {fieldErrors.goals && <p className="text-[#FF8A80] text-xs mt-1">{fieldErrors.goals}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
              Notas para tu coach
            </label>
            <Textarea
              name="notes"
              value={form.notes}
              onChange={(e) => handleTextChange("notes", e.target.value)}
              placeholder="Material disponible, preferencias, limitaciones…"
              className="w-full bg-[#252525] border border-[#3A3A3A] text-[#E0E0E0] placeholder-[#666] rounded-xl p-3 text-sm min-h-[5rem] focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A]"
            />
            {fieldErrors.notes && <p className="text-[#FF8A80] text-xs mt-1">{fieldErrors.notes}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-6">
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting || loadingInitial}
          className="w-full min-h-12 rounded-xl font-semibold disabled:opacity-70"
        >
          {submitting ? <SmallLoader /> : "Enviar solicitud"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
          className="w-full min-h-11 rounded-xl text-sm"
        >
          Cancelar
        </Button>
      </div>
    </BottomSheet>
  );
}
