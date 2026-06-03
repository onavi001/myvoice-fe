import { useState } from "react";
import { ShareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import HappyCoach from "../mascot/HappyCoach";
import Button from "../Button";
import { shareRoutineCompletion } from "../../utils/routineShare/shareRoutineCompletion";

type Props = {
  dayName: string;
  exerciseCount: number;
  onDismiss: () => void;
};

export default function RoutineCompleteCelebrate({ dayName, exerciseCount, onDismiss }: Props) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const result = await shareRoutineCompletion({ dayName, exerciseCount });
      if (result.ok) {
        if (result.method === "download") {
          setFeedback("Imagen guardada. Elige la app en tu galería o pega el texto copiado.");
        } else if (result.method === "clipboard") {
          setFeedback("Texto copiado al portapapeles.");
        } else {
          setFeedback("Elige Instagram, TikTok, WhatsApp, Facebook u otra app.");
        }
      } else if (result.method === "cancelled") {
        setFeedback(null);
      } else {
        setFeedback(result.message ?? "No se pudo compartir en este dispositivo.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="routine-complete-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#34C759]/40 bg-[#1A1A1A] shadow-2xl overflow-hidden">
        <div className="flex justify-end p-2">
          <button
            type="button"
            onClick={onDismiss}
            className="p-2 rounded-lg text-[#B0B0B0] hover:bg-[#2D2D2D] touch-manipulation"
            aria-label="Cerrar felicitación"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pb-2 -mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#34C759] text-center">
            ¡Felicidades!
          </p>
          <h2
            id="routine-complete-title"
            className="text-xl sm:text-2xl font-bold text-[#E0E0E0] text-center mt-1"
          >
            Terminaste tu rutina
          </h2>
          <p className="text-sm text-[#B0B0B0] text-center mt-1">{dayName}</p>
          <p className="text-xs text-[#888] text-center mt-0.5 tabular-nums">
            {exerciseCount} {exerciseCount === 1 ? "ejercicio" : "ejercicios"} · 100%
          </p>
        </div>

        <div className="px-2 py-2">
          <HappyCoach
            variant="celebrate"
            size="lg"
            layout="stacked"
            messageKey="workoutDayComplete"
            animated={false}
          />
        </div>

        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-[#B0B0B0] text-center leading-relaxed">
            Compártelo con tus amigos y motiva a alguien más a entrenar.
          </p>

          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={busy}
            className="w-full min-h-12 rounded-xl border border-[#5DD4F7]/50 bg-gradient-to-r from-[#34C759]/20 to-[#5DD4F7]/20 text-sm font-semibold text-[#E0E0E0] touch-manipulation flex items-center justify-center gap-2 disabled:opacity-60"
            aria-label="Compartir rutina completada"
          >
            <ShareIcon className="w-5 h-5 text-[#5DD4F7]" aria-hidden />
            {busy ? "Preparando imagen…" : "Compartir con amigos"}
          </button>
          <p className="text-[10px] text-[#666] text-center leading-snug">
            Historia, publicación, estado o mensaje · incluye a Happy en la imagen
          </p>
          {feedback ? (
            <p className="text-[10px] text-[#34C759] text-center leading-snug" role="status">
              {feedback}
            </p>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={onDismiss}
            className="w-full min-h-11 rounded-xl text-sm"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
