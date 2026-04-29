import React from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import { ChevronUpIcon, ChevronDownIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import Button from "../Button";
import Input from "../Input";
import Loader from "../Loader";
import { ProgressData } from "../../models/Progress";

interface ProgressCardProps {
  entry: ProgressData;
  index: number;
  expandedCardKey: string | null;
  editData: Record<string, Partial<ProgressData>>;
  savingProgress: Record<string, boolean>;
  deletingProgress: Record<string, boolean>;
  toggleExpandCard: (key: string) => void;
  handleEditChange: (cardKey: string, field: keyof ProgressData, value: string | number | Date) => void;
  handleSaveEdit: (progressId: string) => void;
  handleDelete: (progressId: string) => void;
}

const ProgressCard = React.memo(
  ({
    entry,
    index,
    expandedCardKey,
    editData,
    savingProgress,
    deletingProgress,
    toggleExpandCard,
    handleEditChange,
    handleSaveEdit,
    handleDelete,
  }: ProgressCardProps) => {
    const cardKey = entry._id;
    const isExpanded = expandedCardKey === cardKey;
    const edited = editData[cardKey] || {};
    const currentEntry = { ...entry, ...edited };
    const isSaving = savingProgress[cardKey] || false;
    const isDeleting = deletingProgress[cardKey] || false;

    return (
      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
        <div className="bg-[#252525] border border-[#3A3A3A] rounded-lg p-2 sm:p-3 overflow-hidden">
          <div
            className="flex justify-between items-center cursor-pointer hover:bg-[#2D2D2D] transition-colors"
            onClick={() => toggleExpandCard(cardKey)}
            role="button"
            aria-expanded={isExpanded}
            aria-label={`Toggle ${currentEntry.exerciseName} details`}
          >
            <div className="flex-1 truncate">
              <span className="text-base text-[#E0E0E0]">{currentEntry.exerciseName}</span>
              <p className="text-xs sm:text-sm text-[#B0B0B0]">{new Date(currentEntry.date).toLocaleDateString()}</p>
            </div>
            <span className="text-[#E0E0E0]">
              {isExpanded ? <ChevronUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </span>
          </div>
          {isExpanded && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 sm:mt-3 space-y-2 sm:space-y-3"
            >
              <div>
                <label className="block text-xs sm:text-sm text-[#E0E0E0]">Fecha</label>
                <DatePicker
                  selected={new Date(currentEntry.date)}
                  onChange={(date: Date | null) => {
                    if (date) handleEditChange(cardKey, "date", date);
                  }}
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                  dateFormat="yyyy-MM-dd"
                  aria-label="Edit progress date"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Series</label>
                  <Input
                    name="sets"
                    type="number"
                    value={currentEntry.sets}
                    onChange={(e) => handleEditChange(cardKey, "sets", Number(e.target.value))}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    min="0"
                    aria-label="Edit sets"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Reps</label>
                  <Input
                    name="reps"
                    type="number"
                    value={currentEntry.reps}
                    onChange={(e) => handleEditChange(cardKey, "reps", Number(e.target.value))}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    min="0"
                    aria-label="Edit reps"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Unidad Reps</label>
                  <select
                    name="repsUnit"
                    value={currentEntry.repsUnit || "count"}
                    onChange={(e) => handleEditChange(cardKey, "repsUnit", e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    aria-label="Edit reps unit"
                  >
                    <option value="count">Unidades (U)</option>
                    <option value="seconds">Segundos (S)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Peso</label>
                  <Input
                    name="weight"
                    type="number"
                    value={currentEntry.weight}
                    onChange={(e) => handleEditChange(cardKey, "weight", Number(e.target.value))}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    min="0"
                    step="0.1"
                    aria-label="Edit weight"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Unidad Peso</label>
                  <select
                    name="weightUnit"
                    value={currentEntry.weightUnit || "kg"}
                    onChange={(e) => handleEditChange(cardKey, "weightUnit", e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    aria-label="Edit weight unit"
                  >
                    <option value="kg">Kilos (kg)</option>
                    <option value="lb">Libras (lb)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#E0E0E0]">Notas</label>
                <textarea
                  value={currentEntry.notes || ""}
                  onChange={(e) => handleEditChange(cardKey, "notes", e.target.value)}
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-16 resize-none focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                  aria-label="Edit notes"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSaveEdit(cardKey)}
                  disabled={isSaving || isDeleting}
                  className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  aria-label="Save progress"
                >
                  {isSaving ? (
                    <Loader />
                  ) : (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Guardar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDelete(cardKey)}
                  disabled={isSaving || isDeleting}
                  className="flex-1 border border-[#3A3A3A] bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  aria-label="Delete progress"
                >
                  {isDeleting ? (
                    <Loader />
                  ) : (
                    <>
                      <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Eliminar
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  },
  (prev, next) =>
    prev.entry._id === next.entry._id &&
    prev.expandedCardKey === next.expandedCardKey &&
    prev.editData[next.entry._id] === next.editData[next.entry._id] &&
    prev.savingProgress[next.entry._id] === next.savingProgress[next.entry._id] &&
    prev.deletingProgress[next.entry._id] === next.deletingProgress[next.entry._id]
);

export default ProgressCard;

