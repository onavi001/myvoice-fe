import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, ExclamationCircleIcon } from "@heroicons/react/20/solid";
import Card from "../Card";
import Input from "../Input";
import Button from "../Button";
import RoutineExerciseForm, { ExerciseFormData } from "./RoutineExerciseForm";

interface DayLike {
  _id: string;
  dayName: string;
  musclesWorked: string[];
  warmupOptions: string[];
  explanation: string;
  exercises: ExerciseFormData[];
  isOpen: boolean;
}

interface Props {
  day: DayLike;
  dayIndex: number;
  routineId: string;
  isCoachRestricted: boolean;
  errors?: string[];
  circuitColors: string[];
  toggleDay: (dayIndex: number) => void;
  handleDayChange: (dayIndex: number, field: string, value: string) => void;
  handleExerciseChange: (dayIndex: number, exerciseId: string, field: string, value: string | number) => void;
  handleDeleteExercise: (dayIndex: number, exerciseId: string) => void;
  toggleExercise: (dayIndex: number, exerciseId: string) => void;
  handleDeleteDay: (dayIndex: number) => void;
  handleAddExercise: (dayIndex: number) => void;
  groupExercisesByCircuit: (exercises: ExerciseFormData[]) => { circuits: { [key: string]: ExerciseFormData[] }; standalone: ExerciseFormData[] };
  getCircuitIdsForDay: (dayIndex: number) => string[];
  totalDays: number;
}

export default function RoutineDayCard(props: Props) {
  const {
    day,
    dayIndex,
    routineId,
    isCoachRestricted,
    errors,
    circuitColors,
    toggleDay,
    handleDayChange,
    handleExerciseChange,
    handleDeleteExercise,
    toggleExercise,
    handleDeleteDay,
    handleAddExercise,
    groupExercisesByCircuit,
    getCircuitIdsForDay,
    totalDays,
  } = props;

  const { circuits, standalone } = groupExercisesByCircuit(day.exercises);
  const circuitIds = getCircuitIdsForDay(dayIndex);

  return (
    <motion.div key={day._id} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md transition-all duration-300 ${day.isOpen ? "shadow-lg" : "shadow-sm"}`}>
        <motion.div className="flex justify-between items-center cursor-pointer mb-4" onClick={(e) => { e.stopPropagation(); toggleDay(dayIndex); }} whileHover={{ scale: 1.02 }}>
          <h2 className="text-lg sm:text-xl font-bold text-[#34C759]">{day.dayName || `Día ${dayIndex + 1}`} ({day.exercises.length} ejercicios)</h2>
          <span className="text-[#34C759] text-sm font-bold">{day.isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}</span>
        </motion.div>

        {day.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#E0E0E0] text-sm font-medium mb-1">Nombre del Día</label>
                <Input name={`dayName-${dayIndex}`} value={day.dayName} onChange={(e) => handleDayChange(dayIndex, "dayName", e.target.value)} placeholder={`Día ${dayIndex + 1}`} disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" />
                {errors?.[dayIndex]?.includes("nombre") && (<p className="text-[#EF5350] text-xs mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" /> El nombre del día es obligatorio</p>)}
              </div>
              <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Músculos Trabajados</label><Input name={`musclesWorked-${dayIndex}`} value={day.musclesWorked.join(", ")} onChange={(e) => handleDayChange(dayIndex, "musclesWorked", e.target.value)} placeholder="Pecho, Tríceps" disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
              <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Opciones de Calentamiento</label><Input name={`warmupOptions-${dayIndex}`} value={day.warmupOptions.join(", ")} onChange={(e) => handleDayChange(dayIndex, "warmupOptions", e.target.value)} placeholder="Caminadora, Estiramientos" disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
              <div><label className="block text-[#E0E0E0] text-sm font-medium mb-1">Explicación</label><Input name={`explanation-${dayIndex}`} value={day.explanation} onChange={(e) => handleDayChange(dayIndex, "explanation", e.target.value)} placeholder="Notas sobre el día" disabled={isCoachRestricted} className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12" /></div>
            </div>

            {standalone.length > 0 && (
              <Card className="p-3 bg-[#303030] border border-[#4A4A4A] rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-[#FFD700] mb-3">Ejercicios Individuales</h3>
                <div className="space-y-3 divide-y divide-[#4A4A4A]">
                  {standalone.map((exercise, exerciseIndex) => (
                    <RoutineExerciseForm key={exercise._id} dayIndex={dayIndex} exercise={exercise} exerciseIndex={exerciseIndex} circuitIds={circuitIds} onChange={handleExerciseChange} onDelete={handleDeleteExercise} onToggle={() => toggleExercise(dayIndex, exercise._id)} routineId={routineId} isCoachRestricted={isCoachRestricted} />
                  ))}
                </div>
              </Card>
            )}

            {Object.entries(circuits).map(([circuitId, exercises], circuitIndex) => (
              <Card key={circuitId} className={`p-3 bg-[${circuitColors[circuitIndex % circuitColors.length]}] border-2 border-[${circuitColors[circuitIndex % circuitColors.length]}] rounded-lg shadow-sm`}>
                <h3 className="text-sm font-semibold text-[#FFD700] mb-3">Circuito: {circuitId}</h3>
                <div className="space-y-3 divide-y divide-[#4A4A4A]">
                  {exercises.map((exercise, exerciseIndex) => (
                    <RoutineExerciseForm key={exercise._id} dayIndex={dayIndex} exercise={exercise} exerciseIndex={exerciseIndex} circuitIds={circuitIds} onChange={handleExerciseChange} onDelete={handleDeleteExercise} onToggle={() => toggleExercise(dayIndex, exercise._id)} routineId={routineId} isCoachRestricted={isCoachRestricted} />
                  ))}
                </div>
              </Card>
            ))}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" onClick={() => handleDeleteDay(dayIndex)} disabled={totalDays <= 1 || isCoachRestricted} className="w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-1.5 px-3 text-xs sm:text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-10 sm:min-h-11">Eliminar Día</Button>
              <Button variant="secondary" type="button" onClick={() => handleAddExercise(dayIndex)} disabled={isCoachRestricted} className="w-full bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-lg py-1.5 px-3 text-xs sm:text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-10 sm:min-h-11"><PlusIcon className="w-5 h-5" /> Agregar Ejercicio</Button>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

