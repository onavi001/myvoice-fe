import { XMarkIcon } from "@heroicons/react/24/outline";
import { UsageFeature, freemiumBlockedMessage, getUsageCount, getUsageLimit } from "../utils/freemium";
import Button from "./Button";

type Props = {
  feature: UsageFeature;
  onClose: () => void;
};

export default function FreemiumGateModal({ feature, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#252525] border border-[#3C3C3C] p-5">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-semibold text-[#E0E0E0]">Límite del plan gratis</h2>
          <button type="button" onClick={onClose} className="p-2 text-[#888]" aria-label="Cerrar">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[#B0B0B0] mb-4">{freemiumBlockedMessage(feature)}</p>
        <p className="text-xs text-[#888] mb-4 tabular-nums">
          Uso este mes: {getUsageCount(feature)} / {getUsageLimit(feature)}
        </p>
        <p className="text-xs text-[#34C759] mb-4">
          My Voice Pro (próximamente): IA ilimitada, sin anuncios y exportación PDF sin límites.
        </p>
        <Button onClick={onClose} className="w-full min-h-11 rounded-xl">
          Entendido
        </Button>
      </div>
    </div>
  );
}
