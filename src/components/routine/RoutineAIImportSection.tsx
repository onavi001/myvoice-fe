import { useRef, useState } from "react";
import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Input from "../Input";
import Button from "../Button";
import { prepareRoutineImportFiles } from "../../utils/routineImportFiles";

const FIELD_CLASS =
  "w-full min-h-12 px-4 py-3 bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#888] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#252525] transition-colors touch-manipulation";

const TEXTAREA_CLASS = `${FIELD_CLASS} min-h-[4.5rem] resize-y leading-relaxed`;

export type RoutineImportPayload = {
  name: string;
  notes: string;
  extractedText: string;
};

type Props = {
  disabled?: boolean;
  onImport: (payload: RoutineImportPayload) => void | Promise<void>;
};

export default function RoutineAIImportSection({ disabled, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("Rutina importada");
  const [notes, setNotes] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const appendFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    setLocalError(null);
    const merged = [...files, ...incoming].slice(0, 4);
    setFiles(merged);
  };

  const handleFileChange = (list: FileList | null) => {
    if (!list?.length) return;
    appendFiles(Array.from(list));
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setLocalError(null);
  };

  const handleImport = async () => {
    setLocalError(null);
    setPreparing(true);
    try {
      const prepared = await prepareRoutineImportFiles(files);
      await onImport({
        name: name.trim() || "Rutina importada",
        notes: notes.trim(),
        extractedText: prepared.extractedText,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Error al preparar archivos");
    } finally {
      setPreparing(false);
    }
  };

  const busy = disabled || preparing;

  return (
    <div className="space-y-5">
      <p className="text-sm text-[#B0B0B0] leading-relaxed">
        Sube un PDF o TXT de tu rutina. La IA leera el contenido y creara la rutina en
        My Voice para que la revises antes de guardar.
      </p>

      <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Archivos</label>

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="w-full min-h-[6rem] rounded-xl border-2 border-dashed border-[#4A4A4A] bg-[#222] flex flex-col items-center justify-center gap-2 text-[#B0B0B0] active:bg-[#2A2A2A] transition-colors touch-manipulation disabled:opacity-50"
      >
        <DocumentTextIcon className="w-7 h-7 text-[#34C759]" aria-hidden />
        <span className="text-sm font-medium text-[#E0E0E0]">PDF o TXT</span>
        <span className="text-xs px-4 text-center">Hasta 4 archivos</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,text/plain,.txt"
        multiple
        className="sr-only"
        onChange={(e) => handleFileChange(e.target.files)}
        aria-label="Seleccionar archivos de rutina"
      />

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 min-h-12 px-3 py-2 rounded-xl bg-[#2D2D2D] border border-[#4A4A4A]"
            >
              <DocumentTextIcon className="w-8 h-8 text-[#34C759] shrink-0" aria-hidden />
              <span className="flex-1 text-sm text-[#E0E0E0] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-2 rounded-lg text-[#B0B0B0] active:bg-[#383838] touch-manipulation"
                aria-label={`Quitar ${file.name}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <label htmlFor="import-routine-name" className="block text-[#E0E0E0] text-sm font-medium">
          Nombre (opcional)
        </label>
        <Input
          id="import-routine-name"
          name="importName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Rutina importada de coach"
          className={FIELD_CLASS}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="import-routine-notes" className="block text-[#E0E0E0] text-sm font-medium">
          Notas para la IA (opcional)
        </label>
        <textarea
          id="import-routine-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: ignora secciones de nutricion, solo ejercicios"
          rows={3}
          className={TEXTAREA_CLASS}
        />
      </div>

      {localError && (
        <p className="text-sm text-[#EF5350]" role="alert">
          {localError}
        </p>
      )}

      <Button
        onClick={() => void handleImport()}
        disabled={busy || files.length === 0}
        className="w-full min-h-14 text-base font-semibold bg-[#34C759] text-black rounded-xl hover:bg-[#2ca44e] border border-[#34C759] shadow-md disabled:opacity-50 touch-manipulation"
      >
        {preparing ? "Leyendo archivos..." : "Importar rutina con IA"}
      </Button>
    </div>
  );
}
