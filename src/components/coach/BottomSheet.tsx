import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function BottomSheet({ open, onClose, title, children }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bottom-sheet-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] rounded-t-2xl bg-[#1A1A1A] border-t border-[#3A3A3A] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3A] shrink-0">
          <h2 id="bottom-sheet-title" className="text-base font-semibold text-[#E0E0E0]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#B0B0B0] hover:bg-[#2D2D2D] touch-manipulation min-h-10 min-w-10 flex items-center justify-center"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
