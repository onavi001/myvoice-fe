import { useState } from "react";
import { useSelector } from "react-redux";
import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { RootState } from "../../store";
import Button from "../Button";
import { SmallLoader } from "../Loader";
import useExerciseActions from "../../hooks/useExerciseActions";
import { isNativeAndroid } from "../../services/ads/admobConfig";
import { isProUser } from "../../utils/freemium";
import type { ThunkError } from "../../store/routineSlice";
import RegenerateVideosConfirmModal from "./RegenerateVideosConfirmModal";

type Props = {
  exerciseName: string;
  routineId: string;
  dayId: string;
  exerciseId: string;
  className?: string;
  /** En toolbar: mismo alto que el botón vecino y ancho completo de la celda. */
  fullWidth?: boolean;
};

export default function RegenerateExerciseVideosButton({
  exerciseName,
  routineId,
  dayId,
  exerciseId,
  className = "",
  fullWidth = false,
}: Props) {
  const loadingKey = `${routineId}-${dayId}-${exerciseId}`;
  const reduxLoading = useSelector((state: RootState) => state.routine.loadingVideos[loadingKey]);
  const { handleRegenerateVideos } = useExerciseActions();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const onConfirmSearch = async (searchQuery: string) => {
    setModalError(null);
    try {
      await handleRegenerateVideos(searchQuery, routineId, dayId, exerciseId);
      setConfirmOpen(false);
    } catch (err) {
      const error = err as ThunkError;
      setModalError(error.message || "Error al regenerar videos");
    }
  };

  const showAdHint = isNativeAndroid() && !isProUser() && !fullWidth;

  const buttonClass = fullWidth
    ? "w-full flex items-center justify-center gap-1.5 bg-[#42A5F5] text-black px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#1E88E5] min-h-11 disabled:opacity-50 border border-[#1E88E5] touch-manipulation"
    : "flex items-center justify-center gap-1 bg-[#42A5F5] text-black px-2 py-1.5 rounded-full text-xs hover:bg-[#1E88E5] min-h-9 disabled:opacity-50 border border-[#1E88E5] touch-manipulation";

  return (
    <>
      <div className={fullWidth ? `flex flex-col min-w-0 flex-1 ${className}` : className}>
        <Button
          type="button"
          onClick={() => {
            setModalError(null);
            setConfirmOpen(true);
          }}
          disabled={Boolean(reduxLoading) || !exerciseName.trim()}
          className={buttonClass}
          aria-label="Regenerar videos del ejercicio"
        >
          {reduxLoading ? <SmallLoader /> : <ArrowPathIcon className="w-4 h-4 shrink-0" />}
          <span className="truncate">{reduxLoading ? "Buscando…" : "Regenerar videos"}</span>
        </Button>
        {showAdHint && !reduxLoading ? (
          <p className="text-[10px] text-[#666] mt-1 text-center leading-snug">
            En Android puede mostrarse un anuncio breve.
          </p>
        ) : null}
      </div>

      <RegenerateVideosConfirmModal
        isOpen={confirmOpen}
        exerciseName={exerciseName}
        loading={reduxLoading}
        error={modalError}
        onClose={() => setConfirmOpen(false)}
        onConfirm={(query) => void onConfirmSearch(query)}
      />
    </>
  );
}
