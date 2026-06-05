import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { RoutineData } from "../../models/Routine";
import BottomSheet from "./BottomSheet";
import Button from "../Button";
import { SmallLoader } from "../Loader";

type Props = {
  open: boolean;
  onClose: () => void;
  routines: RoutineData[];
  assigning: boolean;
  onAssign: (routineId: string, message?: string) => Promise<void>;
};

export default function AssignRoutineSheet({
  open,
  onClose,
  routines,
  assigning,
  onAssign,
}: Props) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const coachTemplates = routines.filter((r) => !r.couchId);

  const handleAssign = async () => {
    if (!selectedId) return;
    await onAssign(selectedId, message.trim() || undefined);
    setSelectedId(null);
    setMessage("");
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Asignar rutina al cliente">
      {coachTemplates.length === 0 ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-sm text-[#B0B0B0]">
            Crea una rutina plantilla primero; luego podrás asignarla a tu cliente.
          </p>
          <Button
            type="button"
            onClick={() => {
              onClose();
              navigate("/routine-form");
            }}
            className="w-full min-h-11 rounded-xl"
          >
            <PlusIcon className="w-5 h-5 inline mr-1" aria-hidden />
            Crear rutina plantilla
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[#888]">Elige una de tus rutinas para copiarla al cliente.</p>
          <ul className="space-y-2" role="listbox" aria-label="Rutinas plantilla">
            {coachTemplates.map((routine) => {
              const selected = selectedId === routine._id;
              return (
                <li key={routine._id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setSelectedId(routine._id)}
                    className={`w-full text-left rounded-xl border px-4 py-3 touch-manipulation min-h-12 transition-colors ${
                      selected
                        ? "border-[#34C759] bg-[#34C759]/10"
                        : "border-[#3A3A3A] bg-[#252525] hover:border-[#4A4A4A]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#E0E0E0]">{routine.name}</p>
                    <p className="text-xs text-[#888] mt-0.5">
                      {routine.days?.length ?? 0}{" "}
                      {(routine.days?.length ?? 0) === 1 ? "día" : "días"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
          <label className="block">
            <span className="text-xs text-[#888]">Mensaje para el cliente (opcional)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Ej. Esta semana subimos volumen en pierna…"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#3A3A3A] text-sm text-[#E0E0E0] resize-none"
            />
            <span className="text-[10px] text-[#666]">{message.length}/500</span>
          </label>
          <Button
            type="button"
            onClick={() => void handleAssign()}
            disabled={!selectedId || assigning}
            className="w-full min-h-12 rounded-xl font-semibold disabled:opacity-50"
          >
            {assigning ? <SmallLoader /> : "Asignar rutina"}
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}
