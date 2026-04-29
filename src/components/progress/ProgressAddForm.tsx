import { AnimatePresence, motion } from "framer-motion";
import { MinusIcon, PlusIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import Button from "../Button";
import Input from "../Input";
import Loader from "../Loader";
import { ProgressData } from "../../models/Progress";

interface ProgressAddFormProps {
  showAddForm: boolean;
  onToggleShowAddForm: () => void;
  onCloseForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newProgress: Omit<ProgressData, "_id" | "userId">;
  formErrors: Partial<Record<keyof Omit<ProgressData, "_id" | "userId">, string>>;
  exercises: string[];
  addingProgress: boolean;
  onChange: (field: keyof Omit<ProgressData, "_id" | "userId">, value: string | number | Date) => void;
}

export default function ProgressAddForm({
  showAddForm,
  onToggleShowAddForm,
  onCloseForm,
  onSubmit,
  newProgress,
  formErrors,
  exercises,
  addingProgress,
  onChange,
}: ProgressAddFormProps) {
  return (
    <div className="mt-4">
      <div
        className="p-2 sm:p-3 cursor-pointer hover:bg-[#2D2D2D] transition-colors rounded-lg"
        onClick={onToggleShowAddForm}
        role="button"
        aria-expanded={showAddForm}
        aria-label="Toggle add progress form"
      >
        <h3 className="text-base text-[#E0E0E0] flex items-center gap-2">
          {showAddForm ? <MinusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          {showAddForm ? "Ocultar Formulario" : "Agregar Progreso"}
        </h3>
      </div>
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-2 sm:p-3 bg-[#2D2D2D] rounded-lg space-y-2 sm:space-y-3"
          >
            <form onSubmit={onSubmit} className="space-y-2 sm:space-y-3">
              <div>
                <label className="block text-xs sm:text-sm text-[#E0E0E0]">Ejercicio</label>
                <select
                  name="exerciseName"
                  value={newProgress.exerciseName}
                  onChange={(e) => onChange("exerciseName", e.target.value)}
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                  aria-label="Select exercise"
                >
                  <option value="">Seleccionar ejercicio</option>
                  {exercises.filter((exercise) => exercise).map((exercise) => (
                    <option key={exercise} value={exercise}>
                      {exercise}
                    </option>
                  ))}
                </select>
                {formErrors.exerciseName && <p className="text-[#E0E0E0] text-xs mt-1">{formErrors.exerciseName}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Series</label>
                  <Input
                    name="sets"
                    type="number"
                    value={newProgress.sets}
                    onChange={(e) => onChange("sets", Number(e.target.value))}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    min="0"
                    aria-label="Add sets"
                  />
                  {formErrors.sets && <p className="text-[#E0E0E0] text-xs mt-1">{formErrors.sets}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Reps</label>
                  <Input
                    name="reps"
                    type="number"
                    value={newProgress.reps}
                    onChange={(e) => onChange("reps", Number(e.target.value))}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    min="0"
                    aria-label="Add reps"
                  />
                  {formErrors.reps && <p className="text-[#E0E0E0] text-xs mt-1">{formErrors.reps}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Unidad Reps</label>
                  <select
                    name="repsUnit"
                    value={newProgress.repsUnit}
                    onChange={(e) => onChange("repsUnit", e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    aria-label="Add reps unit"
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
                    value={newProgress.weight}
                    onChange={(e) => onChange("weight", Number(e.target.value))}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    min="0"
                    step="0.1"
                    aria-label="Add weight"
                  />
                  {formErrors.weight && <p className="text-[#E0E0E0] text-xs mt-1">{formErrors.weight}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-[#E0E0E0]">Unidad Peso</label>
                  <select
                    name="weightUnit"
                    value={newProgress.weightUnit}
                    onChange={(e) => onChange("weightUnit", e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    aria-label="Add weight unit"
                  >
                    <option value="kg">Kilos (kg)</option>
                    <option value="lb">Libras (lb)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#E0E0E0]">Notas</label>
                <textarea
                  value={newProgress.notes}
                  onChange={(e) => onChange("notes", e.target.value)}
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-16 resize-none focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                  aria-label="Add notes"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-[#E0E0E0]">Fecha</label>
                <DatePicker
                  selected={newProgress.date instanceof Date ? newProgress.date : new Date()}
                  onChange={(date: Date | null) => onChange("date", date || new Date())}
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                  dateFormat="yyyy-MM-dd"
                  aria-label="Add progress date"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={addingProgress}
                  className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  aria-label="Save new progress"
                >
                  {addingProgress ? (
                    <Loader />
                  ) : (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Guardar
                    </>
                  )}
                </Button>
                <Button
                  onClick={onCloseForm}
                  disabled={addingProgress}
                  className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  aria-label="Cancel adding progress"
                >
                  <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

