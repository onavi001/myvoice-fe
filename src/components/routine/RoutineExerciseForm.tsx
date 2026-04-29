import { memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Button from "../Button";
import Card from "../Card";
import Input from "../Input";
import Textarea from "../Textarea";
import { IExercise } from "../../models/Exercise";

export interface ExerciseFormData extends IExercise {
  isOpen: boolean;
}

interface RoutineExerciseFormProps {
  dayIndex: number;
  exercise: ExerciseFormData;
  exerciseIndex: number;
  circuitIds: string[];
  onChange: (dayIndex: number, exerciseId: string, field: string, value: string | number) => void;
  onDelete: (dayIndex: number, exerciseId: string) => void;
  onToggle: () => void;
  routineId: string;
  isCoachRestricted: boolean;
}

const RoutineExerciseForm = memo(
  ({ dayIndex, exercise, exerciseIndex, circuitIds, onChange, onDelete, onToggle, routineId, isCoachRestricted }: RoutineExerciseFormProps) => {
    const navigate = useNavigate();

    return (
      <motion.div className="pt-3 first:pt-0" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className={`p-3 bg-${exerciseIndex % 2 === 0 ? "[#252525]" : "[#282828]"} border border-[#4A4A4A] rounded-lg transition-all duration-300 ${exercise.isOpen ? "shadow-md" : "shadow-sm"}`}>
          <motion.div className="flex justify-between items-center cursor-pointer mb-2" onClick={(e) => { e.stopPropagation(); onToggle(); }} whileHover={{ scale: 1.02 }}>
            <h4 className="text-sm font-semibold text-[#42A5F5]">{exercise.name || `Ejercicio ${exerciseIndex + 1}`}</h4>
            <span className="text-[#34C759] text-sm font-bold">{exercise.isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}</span>
          </motion.div>
          {exercise.isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-3 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Nombre del Ejercicio</label><Input name={`exerciseName-${exercise._id}`} value={exercise.name} onChange={(e) => onChange(dayIndex, exercise._id, "name", e.target.value)} placeholder="Nombre del ejercicio" disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
                <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Circuito (opcional)</label><select name={`circuitId-${exercise._id}`} value={exercise.circuitId || ""} onChange={(e) => onChange(dayIndex, exercise._id, "circuitId", e.target.value)} disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12"><option value="">Sin Circuito</option>{circuitIds.map((id) => (<option key={id} value={id}>{id}</option>))}<option value={`C${circuitIds.length + 1}`}>Nuevo: C{circuitIds.length + 1}</option></select></div>
                <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Músculos Trabajados</label><Input name={`muscleGroup-${exercise._id}`} value={exercise.muscleGroup.join(", ")} onChange={(e) => onChange(dayIndex, exercise._id, "muscleGroup", e.target.value)} placeholder="Músculos (ej. Pecho, Hombros)" disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
                <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Consejos</label><Input name={`tips-${exercise._id}`} value={exercise.tips.join(", ")} onChange={(e) => onChange(dayIndex, exercise._id, "tips", e.target.value)} placeholder="Consejos (ej. Mantén la espalda recta)" disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Series</label><Input name={`sets-${exercise._id}`} type="number" value={exercise.sets} onChange={(e) => onChange(dayIndex, exercise._id, "sets", Number(e.target.value))} disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
                <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Repeticiones</label><Input name={`reps-${exercise._id}`} type="number" value={exercise.reps} onChange={(e) => onChange(dayIndex, exercise._id, "reps", Number(e.target.value))} disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
                <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Unidad Reps</label><select name={`repsUnit-${exercise._id}`} value={exercise.repsUnit || "count"} onChange={(e) => onChange(dayIndex, exercise._id, "repsUnit", e.target.value)} disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12"><option value="count">Unidades (U)</option><option value="seconds">Segundos (S)</option></select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Descanso (s)</label><Input name={`rest-${exercise._id}`} type="number" value={exercise.rest} onChange={(e) => onChange(dayIndex, exercise._id, "rest", e.target.value)} disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
                <div className="sm:col-span-2"><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Notas</label><Textarea name={`notes-${exercise._id}`} value={exercise.notes || ""} onChange={(e) => onChange(dayIndex, exercise._id, "notes", e.target.value)} disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors h-20 resize-none" /></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="button" onClick={() => onDelete(dayIndex, exercise._id)} disabled={isCoachRestricted} className="w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-1.5 px-3 text-xs sm:text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-10 sm:min-h-11">Eliminar</Button>
                <Button type="button" onClick={() => navigate(`/routine-edit/${routineId}/videos/${dayIndex}/${exerciseIndex}`)} disabled={isCoachRestricted} className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg py-1.5 px-3 text-xs sm:text-sm font-semibold border border-[#1E88E5] shadow-md disabled:bg-[#1E88E5]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-10 sm:min-h-11">Videos</Button>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.dayIndex === nextProps.dayIndex &&
    prevProps.exercise._id === nextProps.exercise._id &&
    prevProps.exercise.isOpen === nextProps.exercise.isOpen &&
    prevProps.exercise.name === nextProps.exercise.name &&
    prevProps.exercise.circuitId === nextProps.exercise.circuitId &&
    prevProps.exercise.muscleGroup.join(",") === nextProps.exercise.muscleGroup.join(",") &&
    prevProps.exercise.tips.join(",") === nextProps.exercise.tips.join(",") &&
    prevProps.exercise.sets === nextProps.exercise.sets &&
    prevProps.exercise.reps === nextProps.exercise.reps &&
    prevProps.exercise.repsUnit === nextProps.exercise.repsUnit &&
    prevProps.exercise.rest === nextProps.exercise.rest &&
    prevProps.exercise.notes === nextProps.exercise.notes &&
    prevProps.routineId === nextProps.routineId &&
    prevProps.isCoachRestricted === nextProps.isCoachRestricted &&
    prevProps.onToggle === nextProps.onToggle
);

export default RoutineExerciseForm;

