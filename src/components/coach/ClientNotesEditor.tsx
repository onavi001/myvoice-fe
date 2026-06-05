import { useEffect, useState } from "react";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { IUser } from "../../models/Users";
import Button from "../Button";
import { SmallLoader } from "../Loader";

type Props = {
  client: IUser;
  saving?: boolean;
  onSave: (payload: { goals: string; notes: string }) => Promise<void>;
};

export default function ClientNotesEditor({ client, saving, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGoals(client.goals?.join(", ") ?? "");
    setNotes(client.notes ?? "");
  }, [client._id, client.goals, client.notes]);

  const handleSave = async () => {
    setError(null);
    try {
      await onSave({ goals, notes });
      setEditing(false);
    } catch {
      setError("No se pudo guardar");
    }
  };

  const handleCancel = () => {
    setGoals(client.goals?.join(", ") ?? "");
    setNotes(client.notes ?? "");
    setEditing(false);
    setError(null);
  };

  return (
    <section className="rounded-xl border border-[#3A3A3A] bg-[#252525] p-4 mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="text-sm font-semibold text-[#5DD4F7]">Objetivos y notas</h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-[#888] hover:text-[#E0E0E0] touch-manipulation min-h-9 px-2"
          >
            <PencilIcon className="w-4 h-4" aria-hidden />
            Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-[#888]">Objetivos</span>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Ej. ganar fuerza, perder peso"
              className="mt-1 w-full min-h-10 px-3 rounded-lg bg-[#1A1A1A] border border-[#4A4A4A] text-sm text-[#E0E0E0]"
            />
          </label>
          <label className="block">
            <span className="text-xs text-[#888]">Notas del coach</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Observaciones, lesiones, preferencias…"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#4A4A4A] text-sm text-[#E0E0E0] resize-none"
            />
          </label>
          {error && (
            <p className="text-xs text-[#FF8A80]" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex-1 min-h-10 rounded-lg text-sm flex items-center justify-center gap-1"
            >
              {saving ? (
                <SmallLoader />
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" /> Guardar
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="min-h-10 px-4 rounded-lg text-sm"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-[#E0E0E0]">
            <span className="text-[#888]">Objetivos: </span>
            {client.goals?.length ? client.goals.join(", ") : "Sin objetivos"}
          </p>
          <p className="text-sm text-[#E0E0E0] mt-2 break-words">
            <span className="text-[#888]">Notas: </span>
            {client.notes || "Sin notas"}
          </p>
          {client.trainingProfile ? (
            <ul className="text-xs text-[#B0B0B0] mt-3 space-y-1 border-t border-[#3A3A3A] pt-3">
              <li>
                Sesión ~{client.trainingProfile.sessionDurationMin} min ·{" "}
                {client.trainingProfile.weightKg} kg
              </li>
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}
