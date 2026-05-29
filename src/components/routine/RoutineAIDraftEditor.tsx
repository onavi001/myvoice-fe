import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { RoutineData } from "../../models/Routine";
import Input from "../Input";
import { newTempId } from "../../utils/nativeMediaPicker";
import { formatListField, parseListFieldInput } from "../../utils/listFieldInput";

const FIELD =
  "w-full min-h-11 px-3 py-2.5 bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#888] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#252525] touch-manipulation";

const LABEL = "block text-[#B0B0B0] text-xs font-medium mb-1";

type Day = RoutineData["days"][number];
type Exercise = Day["exercises"][number];

type Props = {
  routine: RoutineData;
  onChange: (routine: RoutineData) => void;
};

export default function RoutineAIDraftEditor({ routine, onChange }: Props) {
  const totalExercises = routine.days.reduce((n, d) => n + (d.exercises?.length ?? 0), 0);

  const [openDays, setOpenDays] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    routine.days.forEach((d, i) => {
      initial[d._id] = i === 0;
    });
    return initial;
  });

  const updateRoutine = (patch: Partial<RoutineData>) => {
    onChange({ ...routine, ...patch });
  };

  const updateDay = (dayId: string, patch: Partial<Day>) => {
    onChange({
      ...routine,
      days: routine.days.map((d) => (d._id === dayId ? { ...d, ...patch } : d)),
    });
  };

  const updateExercise = (dayId: string, exerciseId: string, patch: Partial<Exercise>) => {
    onChange({
      ...routine,
      days: routine.days.map((d) =>
        d._id !== dayId
          ? d
          : {
              ...d,
              exercises: d.exercises.map((ex) =>
                ex._id === exerciseId ? { ...ex, ...patch } : ex
              ),
            }
      ),
    });
  };

  const addExercise = (dayId: string) => {
    const day = routine.days.find((d) => d._id === dayId);
    if (!day) return;
    const exercise: Exercise = {
      _id: newTempId(),
      name: "Nuevo ejercicio",
      muscleGroup: [],
      sets: 3,
      reps: 10,
      repsUnit: "count",
      weightUnit: "kg",
      weight: 0,
      rest: "60",
      tips: [],
      completed: false,
      videos: [],
      notes: "",
      circuitId: "",
    };
    updateDay(dayId, { exercises: [...day.exercises, exercise] });
    setOpenDays((prev) => ({ ...prev, [dayId]: true }));
  };

  const removeExercise = (dayId: string, exerciseId: string) => {
    const day = routine.days.find((d) => d._id === dayId);
    if (!day || day.exercises.length <= 1) return;
    updateDay(dayId, {
      exercises: day.exercises.filter((ex) => ex._id !== exerciseId),
    });
  };

  const toggleDay = (dayId: string) => {
    setOpenDays((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const splitCsv = parseListFieldInput;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#9ED7A7] leading-relaxed">
        Revisa y corrige la rutina antes de guardar:{" "}
        <strong className="text-white">
          {routine.days.length} días · {totalExercises} ejercicios
        </strong>
        . Los cambios se aplican al pulsar Guardar.
      </p>

      <div>
        <label htmlFor="draft-routine-name" className={LABEL}>
          Nombre de la rutina
        </label>
        <Input
          id="draft-routine-name"
          name="draftRoutineName"
          type="text"
          value={routine.name}
          onChange={(e) => updateRoutine({ name: e.target.value })}
          className={FIELD}
        />
      </div>

      {routine.days.map((day, dayIndex) => {
        const isOpen = openDays[day._id] ?? false;
        return (
          <section
            key={day._id}
            className="rounded-xl border border-[#4A4A4A] bg-[#252525] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleDay(day._id)}
              className="w-full flex items-center justify-between gap-2 min-h-14 px-4 py-3 text-left touch-manipulation active:bg-[#2D2D2D]"
            >
              <span className="font-semibold text-[#34C759] text-base truncate">
                {day.dayName || `Día ${dayIndex + 1}`}
              </span>
              <span className="text-xs text-[#B0B0B0] shrink-0">
                {day.exercises.length} ejercicios
              </span>
              {isOpen ? (
                <ChevronUpIcon className="w-5 h-5 text-[#34C759] shrink-0" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-[#34C759] shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-[#3C3C3C] pt-4">
                <div>
                  <label className={LABEL}>Nombre del día</label>
                  <Input
                    name={`dayName-${day._id}`}
                    type="text"
                    value={day.dayName}
                    onChange={(e) => updateDay(day._id, { dayName: e.target.value })}
                    className={FIELD}
                  />
                </div>
                <div>
                  <label className={LABEL}>Músculos (separados por coma)</label>
                  <Input
                    name={`muscles-${day._id}`}
                    type="text"
                    value={formatListField(day.musclesWorked)}
                    onChange={(e) =>
                      updateDay(day._id, { musclesWorked: splitCsv(e.target.value) })
                    }
                    className={FIELD}
                  />
                </div>
                <div>
                  <label className={LABEL}>Calentamiento (separado por coma)</label>
                  <Input
                    name={`warmup-${day._id}`}
                    type="text"
                    value={formatListField(day.warmupOptions)}
                    onChange={(e) =>
                      updateDay(day._id, { warmupOptions: splitCsv(e.target.value) })
                    }
                    className={FIELD}
                  />
                </div>
                <div>
                  <label className={LABEL}>Notas del día</label>
                  <textarea
                    value={day.explanation}
                    onChange={(e) => updateDay(day._id, { explanation: e.target.value })}
                    rows={2}
                    className={`${FIELD} min-h-[4rem] resize-y`}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#E0E0E0]">Ejercicios</h4>
                  {day.exercises.map((ex, exIndex) => (
                    <div
                      key={ex._id}
                      className="rounded-xl border border-[#3C3C3C] bg-[#222] p-3 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-[#888]">#{exIndex + 1}</span>
                        {day.exercises.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExercise(day._id, ex._id)}
                            className="p-2 rounded-lg text-[#EF5350] active:bg-[#383838] touch-manipulation"
                            aria-label="Eliminar ejercicio"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className={LABEL}>Nombre</label>
                        <Input
                          name={`ex-name-${ex._id}`}
                          type="text"
                          value={ex.name}
                          onChange={(e) =>
                            updateExercise(day._id, ex._id, { name: e.target.value })
                          }
                          className={FIELD}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={LABEL}>Series</label>
                          <Input
                            name={`ex-sets-${ex._id}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={ex.sets}
                            onChange={(e) =>
                              updateExercise(day._id, ex._id, {
                                sets: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                            className={FIELD}
                          />
                        </div>
                        <div>
                          <label className={LABEL}>Reps / seg</label>
                          <Input
                            name={`ex-reps-${ex._id}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={ex.reps}
                            onChange={(e) =>
                              updateExercise(day._id, ex._id, {
                                reps: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                            className={FIELD}
                          />
                        </div>
                        <div>
                          <label className={LABEL}>Peso</label>
                          <Input
                            name={`ex-weight-${ex._id}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            value={ex.weight}
                            onChange={(e) =>
                              updateExercise(day._id, ex._id, {
                                weight: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className={FIELD}
                          />
                        </div>
                        <div>
                          <label className={LABEL}>Descanso (seg)</label>
                          <Input
                            name={`ex-rest-${ex._id}`}
                            type="text"
                            inputMode="numeric"
                            value={ex.rest}
                            onChange={(e) =>
                              updateExercise(day._id, ex._id, { rest: e.target.value })
                            }
                            className={FIELD}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addExercise(day._id)}
                    className="w-full min-h-11 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#4A4A4A] text-sm text-[#34C759] font-medium active:bg-[#2A2A2A] touch-manipulation"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Agregar ejercicio
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
