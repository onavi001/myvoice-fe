import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { AppDispatch } from "../../store";
import { createDay, createRoutine } from "../../store/routineSlice";
import { ROUTINE_TEMPLATES, RoutineTemplate } from "../../data/routineTemplates";
import { IRoutine } from "../../models/Routine";
import { newTempId } from "../../utils/nativeMediaPicker";
import Button from "../Button";

type Props = {
  onClose: () => void;
};

export default function RoutineTemplatesModal({ onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyTemplate = async (template: RoutineTemplate) => {
    setLoadingId(template.id);
    setError(null);
    try {
      const created = await dispatch(
        createRoutine({
          name: template.draft.name,
          days: [],
          notes: template.description,
        } as unknown as IRoutine)
      ).unwrap();
      const routineId = created._id.toString();

      for (const day of template.draft.days) {
        await dispatch(
          createDay({
            routineId,
            dayData: {
              dayName: day.dayName,
              explanation: day.explanation,
              warmupOptions: day.warmupOptions,
              musclesWorked: day.musclesWorked,
              exercises: day.exercises.map((ex) => ({ ...ex, _id: newTempId() })),
            },
          })
        ).unwrap();
      }

      onClose();
      navigate("/routine");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la plantilla");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-[#252525] border border-[#3C3C3C] p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#34C759]">Plantillas de rutina</h2>
          <button type="button" onClick={onClose} className="p-2 text-[#888]" aria-label="Cerrar">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <p className="text-sm text-[#FF8A80] mb-3 p-2 rounded-lg bg-[#3d2a2a]">{error}</p>
        )}
        <ul className="space-y-3">
          {ROUTINE_TEMPLATES.map((tpl) => (
            <li
              key={tpl.id}
              className="rounded-xl border border-[#3C3C3C] bg-[#1A1A1A] p-4"
            >
              <h3 className="font-semibold text-white">{tpl.name}</h3>
              <p className="text-sm text-[#888] mt-1">{tpl.description}</p>
              <p className="text-xs text-[#666] mt-1">{tpl.daysPerWeek} días · {tpl.draft.days.length} sesiones</p>
              <Button
                onClick={() => void applyTemplate(tpl)}
                disabled={loadingId !== null}
                className="w-full mt-3 min-h-11 rounded-xl text-sm"
              >
                {loadingId === tpl.id ? "Creando…" : "Usar plantilla"}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
