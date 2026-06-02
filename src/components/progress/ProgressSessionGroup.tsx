import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { DaySessionGroup } from "../../utils/progressInsights";
import ProgressCard from "./ProgressCard";
import { ProgressData } from "../../models/Progress";

type Props = {
  group: DaySessionGroup;
  expandedCardKey: string | null;
  editData: Record<string, Partial<ProgressData>>;
  savingProgress: Record<string, boolean>;
  deletingProgress: Record<string, boolean>;
  toggleExpandCard: (key: string) => void;
  handleEditChange: (cardKey: string, field: keyof ProgressData, value: string | number | Date) => void;
  handleSaveEdit: (progressId: string) => void;
  handleDelete: (progressId: string) => void;
};

export default function ProgressSessionGroup({
  group,
  expandedCardKey,
  editData,
  savingProgress,
  deletingProgress,
  toggleExpandCard,
  handleEditChange,
  handleSaveEdit,
  handleDelete,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#3C3C3C] bg-[#1A1A1A] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-3 text-left touch-manipulation min-h-[48px] bg-[#252525]"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#E0E0E0]">{group.label}</p>
          <p className="text-xs text-[#888] truncate">
            {group.dayName ? `${group.dayName} · ` : ""}
            {group.exerciseCount} {group.exerciseCount === 1 ? "registro" : "registros"}
          </p>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 shrink-0 text-[#888] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="p-2 space-y-2 border-t border-[#3C3C3C]">
          {group.entries.map((entry, index) => (
            <ProgressCard
              key={entry._id}
              entry={entry}
              index={index}
              expandedCardKey={expandedCardKey}
              editData={editData}
              savingProgress={savingProgress}
              deletingProgress={deletingProgress}
              toggleExpandCard={toggleExpandCard}
              handleEditChange={handleEditChange}
              handleSaveEdit={handleSaveEdit}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
