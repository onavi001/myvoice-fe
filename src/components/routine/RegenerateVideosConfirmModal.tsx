import { useEffect, useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";

type Props = {
  isOpen: boolean;
  exerciseName: string;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (searchQuery: string) => void;
};

export default function RegenerateVideosConfirmModal({
  isOpen,
  exerciseName,
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: Props) {
  const [searchQuery, setSearchQuery] = useState(exerciseName);

  useEffect(() => {
    if (isOpen) setSearchQuery(exerciseName);
  }, [isOpen, exerciseName]);

  const trimmed = searchQuery.trim();
  const nameChanged = trimmed.length > 0 && trimmed !== exerciseName.trim();

  return (
    <Modal isOpen={isOpen} onClose={() => !loading && onClose()}>
      <div className="pt-1 pr-8 text-[#E0E0E0]">
        <h2 className="text-lg font-semibold text-[#42A5F5] mb-2">Buscar videos</h2>
        <p className="text-sm text-[#B0B0B0] mb-4 leading-relaxed">
          ¿El nombre del ejercicio es correcto para YouTube? Si no, edita la búsqueda abajo. Solo
          cambia esta búsqueda, no el nombre guardado en la rutina.
        </p>

        <label htmlFor="video-search-query" className="block text-sm font-medium text-[#E0E0E0] mb-2">
          Término de búsqueda
        </label>
        <Input
          id="video-search-query"
          name="video-search-query"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ej: press banca con barra"
          className="w-full min-h-12 px-4 py-3 bg-[#2D2D2D] border border-[#4A4A4A] rounded-xl text-base mb-2"
          autoComplete="off"
          disabled={loading}
        />

        {nameChanged ? (
          <p className="text-xs text-[#888] mb-3">
            Guardado en rutina: <span className="text-[#E0E0E0]">{exerciseName}</span>
          </p>
        ) : (
          <p className="text-xs text-[#888] mb-3">Usaremos el nombre actual del ejercicio.</p>
        )}

        {error ? (
          <p className="text-sm text-[#FF8A80] mb-3 leading-relaxed" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1 min-h-11 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(trimmed)}
            disabled={loading || !trimmed}
            className="flex-1 min-h-11 rounded-xl bg-[#42A5F5] text-black font-semibold hover:bg-[#1E88E5] border border-[#1E88E5] disabled:opacity-50"
          >
            {loading ? "Buscando…" : "Buscar videos"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
