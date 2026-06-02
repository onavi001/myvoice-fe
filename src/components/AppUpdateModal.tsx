import { openAppStore } from "../services/appUpdate";

type Props = {
  visible: boolean;
  forceUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
  onDismiss: () => void;
};

export default function AppUpdateModal({
  visible,
  forceUpdate,
  currentVersion,
  latestVersion,
  storeUrl,
  onDismiss,
}: Props) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-update-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#3C3C3C] bg-[#1A1A1A] p-5 shadow-2xl">
        <h2 id="app-update-title" className="text-lg font-bold text-[#E0E0E0]">
          {forceUpdate ? "Actualización necesaria" : "Nueva versión disponible"}
        </h2>
        <p className="text-sm text-[#B0B0B0] mt-2 leading-relaxed">
          {forceUpdate
            ? "Esta versión ya no es compatible. Actualiza My Voice en la tienda para seguir entrenando."
            : "Hay una versión más reciente en la tienda con mejoras y correcciones."}
        </p>
        <p className="text-xs text-[#888] mt-3 tabular-nums">
          Tu versión: {currentVersion || "—"} · Disponible: {latestVersion}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => openAppStore(storeUrl)}
            className="w-full min-h-12 rounded-xl bg-[#34C759] text-black font-semibold text-sm touch-manipulation"
          >
            Actualizar en la tienda
          </button>
          {!forceUpdate && (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full min-h-11 rounded-xl border border-[#4A4A4A] text-[#B0B0B0] text-sm font-medium touch-manipulation"
            >
              Más tarde
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
