import { useState } from "react";
import { ArrowDownTrayIcon, ShareIcon } from "@heroicons/react/24/outline";
import Button from "../Button";
import Toast from "../Toast";
import { RoutineData } from "../../models/Routine";
import {
  downloadRoutineAsPdf,
  downloadRoutineAsText,
  shareRoutine,
} from "../../utils/routineExport";

type ToastState = { message: string; type: "success" | "error" } | null;

export default function RoutineExportActions({ routine }: { routine: RoutineData }) {
  const [busy, setBusy] = useState<"pdf" | "share" | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const handleDownloadPdf = async () => {
    setBusy("pdf");
    try {
      await downloadRoutineAsPdf(routine);
      setToast({ message: "PDF listo para guardar o compartir", type: "success" });
    } catch {
      try {
        downloadRoutineAsText(routine);
        setToast({
          message: "No se pudo generar el PDF; se descargo un archivo de texto.",
          type: "success",
        });
      } catch {
        setToast({ message: "Error al exportar la rutina", type: "error" });
      }
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      const result = await shareRoutine(routine);
      if (!result.ok) {
        if (result.method === "cancelled") return;
        setToast({ message: "Compartir no esta disponible en este dispositivo", type: "error" });
        return;
      }
      if (result.method === "file") {
        setToast({ message: "Listo para compartir (PDF)", type: "success" });
      } else if (result.method === "text") {
        setToast({ message: "Rutina compartida como texto", type: "success" });
      } else {
        setToast({ message: "Rutina copiada al portapapeles", type: "success" });
      }
    } catch {
      setToast({ message: "Error al compartir la rutina", type: "error" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={() => void handleDownloadPdf()}
          disabled={busy !== null}
          className="flex items-center gap-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg px-3 py-2 text-xs sm:text-sm min-h-10 transition-colors disabled:opacity-50"
          aria-label="Descargar rutina en PDF"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          {busy === "pdf" ? "Generando..." : "Descargar PDF"}
        </Button>
        <Button
          onClick={() => void handleShare()}
          disabled={busy !== null}
          className="flex items-center gap-2 bg-[#34C759] text-black hover:bg-[#2ca44e] rounded-lg px-3 py-2 text-xs sm:text-sm min-h-10 transition-colors disabled:opacity-50"
          aria-label="Compartir rutina"
        >
          <ShareIcon className="w-4 h-4" />
          {busy === "share" ? "Compartiendo..." : "Compartir rutina"}
        </Button>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </>
  );
}
