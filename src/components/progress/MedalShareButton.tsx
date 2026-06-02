import { useState } from "react";
import { ShareIcon } from "@heroicons/react/24/outline";
import type { ProgressAchievement } from "../../utils/progressAchievements";
import { shareMedalAchievement } from "../../utils/medalShare/shareMedalAchievement";

type Props = {
  achievement: ProgressAchievement;
  className?: string;
};

export default function MedalShareButton({ achievement, className = "" }: Props) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!achievement.unlocked) return null;

  const handleShare = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const result = await shareMedalAchievement(achievement);
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
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={busy}
        className="w-full min-h-11 rounded-lg border border-[#5DD4F7]/50 bg-gradient-to-r from-[#34C759]/15 to-[#5DD4F7]/15 text-xs font-semibold text-[#E0E0E0] touch-manipulation flex items-center justify-center gap-2 disabled:opacity-60"
        aria-label={`Compartir medalla ${achievement.title}`}
      >
        <ShareIcon className="w-4 h-4 text-[#5DD4F7]" aria-hidden />
        {busy ? "Preparando imagen…" : "Compartir medalla"}
      </button>
      <p className="text-[10px] text-[#666] mt-1.5 text-center leading-snug">
        Historia, publicación, estado o mensaje · Instagram, TikTok, WhatsApp, Facebook y más
      </p>
      {feedback ? (
        <p className="text-[10px] text-[#34C759] mt-1 text-center leading-snug" role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
