import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { updateRoutine, deleteRoutine, fetchRoutines, ThunkError } from "../store/routineSlice";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Loader, { SmallLoader } from "../components/Loader";
import { IExercise } from "../models/Exercise";
import { IDay } from "../models/Day";
import { RoutineData } from "../models/Routine";
import Textarea from "../components/Textarea";
import { PlusIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

interface ExerciseFormData extends IExercise {
  isOpen: boolean;
}

interface DayFormData extends IDay {
  isOpen: boolean;
  exercises: ExerciseFormData[];
}

export default function RoutineEdit() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const { routines, loading: routinesLoading } = useSelector((state: RootState) => state.routine);
  const { token, loading: userLoading } = useSelector((state: RootState) => state.user);

  const initialRoutine = routines.find((r) => r._id === routineId);
  const [routineName, setRoutineName] = useState(initialRoutine?.name || "");
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [deletingRoutine, setDeletingRoutine] = useState(false);
  const [addingDay, setAddingDay] = useState(false);
  const [days, setDays] = useState<DayFormData[]>([]);
  const [errors, setErrors] = useState<{ routineName?: string; days?: string[] }>({});
  const [allExpanded, setAllExpanded] = useState(false);

  // Colores para circuitos más distintivos
  const circuitColors = ["#3B4B3B", "#4B3B4B", "#3B4B4B", "#4B4B3B", "#3B3B4B"];

  useEffect(() => {
    if (token && !routines.length && !routinesLoading) {
      dispatch(fetchRoutines());
    }
    if (!token) {
      navigate("/login");
    }
  }, [token, routines, routinesLoading, dispatch, navigate]);

  useEffect(() => {
    if (initialRoutine) {
      setRoutineName(initialRoutine.name);
      setDays(
        initialRoutine.days.map((day) => ({
          ...day,
          isOpen: false,
          exercises: day.exercises.map((exercise) => ({
            ...exercise,
            isOpen: false,
            circuitId: exercise.circuitId || "",
          })),
        }))
      );
    } else if (!routinesLoading && !initialRoutine) {
      navigate("/routine");
    }
  }, [initialRoutine, routinesLoading, navigate]);

  const handleAddDay = () => {
    setAddingDay(true);
    setDays([
      ...days,
      {
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dayName: `Día ${days.length + 1}`,
        musclesWorked: [],
        warmupOptions: [],
        explanation: "",
        exercises: [],
        isOpen: true,
      },
    ]);
    setAddingDay(false);
  };

  const handleAddExercise = (dayIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].exercises.push({
      _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isOpen: true,
      name: "",
      sets: 3,
      reps: 10,
      muscleGroup: [],
      repsUnit: "count",
      weightUnit: "kg",
      weight: 0,
      tips: [],
      videos: [],
      completed: false,
      rest: "60",
      circuitId: "",
    });
    setDays(updatedDays);
  };

  const handleDeleteExercise = (dayIndex: number, exerciseId: string) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter(
      (ex) => ex._id !== exerciseId
    );
    setDays(updatedDays);
  };

  const handleDeleteDay = (dayIndex: number) => {
    setDays(days.filter((_, index) => index !== dayIndex));
  };

  const handleDayChange = (dayIndex: number, field: string, value: string) => {
    const updatedDays = [...days];
    if (field === "musclesWorked" || field === "warmupOptions") {
      updatedDays[dayIndex][field] = value.split(",").map((item) => item.trim());
    } else {
      updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    }
    setDays(updatedDays);
  };

  const handleExerciseChange = (
    dayIndex: number,
    exerciseId: string,
    field: string,
    value: string | number
  ) => {
    const updatedDays = [...days];
    const exerciseIndex = updatedDays[dayIndex].exercises.findIndex((ex) => ex._id === exerciseId);
    if (exerciseIndex !== -1) {
      if (typeof value === "string" && (field === "muscleGroup" || field === "tips")) {
        updatedDays[dayIndex].exercises[exerciseIndex][field] = value.split(",").map((item) => item.trim());
      } else {
        updatedDays[dayIndex].exercises[exerciseIndex] = {
          ...updatedDays[dayIndex].exercises[exerciseIndex],
          [field]: typeof value === "number" ? value : value,
        };
      }
      setDays(updatedDays);
    }
  };

  const toggleDay = (dayIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].isOpen = !updatedDays[dayIndex].isOpen;
    setDays(updatedDays);
  };

  const toggleExercise = (dayIndex: number, exerciseId: string) => {
    const updatedDays = [...days];
    const exerciseIndex = updatedDays[dayIndex].exercises.findIndex((ex) => ex._id === exerciseId);
    if (exerciseIndex !== -1) {
      updatedDays[dayIndex].exercises[exerciseIndex].isOpen =
        !updatedDays[dayIndex].exercises[exerciseIndex].isOpen;
      setDays(updatedDays);
    }
  };

  const toggleAll = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    setDays(
      days.map((day) => ({
        ...day,
        isOpen: newState,
        exercises: day.exercises.map((ex) => ({ ...ex, isOpen: newState })),
      }))
    );
  };

  const getCircuitIdsForDay = (dayIndex: number) => {
    const circuitIds = new Set<string>();
    days[dayIndex].exercises.forEach((ex) => {
      if (ex.circuitId) circuitIds.add(ex.circuitId);
    });
    return Array.from(circuitIds);
  };

  const groupExercisesByCircuit = (exercises: ExerciseFormData[]) => {
    const circuits: { [key: string]: ExerciseFormData[] } = {};
    const standalone: ExerciseFormData[] = [];
    exercises.forEach((ex) => {
      if (ex.circuitId) {
        if (!circuits[ex.circuitId]) circuits[ex.circuitId] = [];
        circuits[ex.circuitId].push(ex);
      } else {
        standalone.push(ex);
      }
    });
    return { circuits, standalone };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { routineName?: string; days?: string[] } = {};
    if (!routineName) newErrors.routineName = "El nombre de la rutina es obligatorio";
    const dayErrors = days.map((day, i) => {
      if (!day.dayName) return `El nombre del Día ${i + 1} es obligatorio`;
      if (day.exercises.some((ex) => !ex.name)) return `Todos los ejercicios del Día ${i + 1} deben tener un nombre`;
      return "";
    }).filter(Boolean);
    if (dayErrors.length) newErrors.days = dayErrors;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSavingRoutine(true);
    setErrors({});

    const cleanedDays = days.map((day: Partial<IDay>) => {
      const { ...dayRest } = day;
      if (dayRest._id?.startsWith("temp")) delete dayRest._id;
      return {
        ...dayRest,
        exercises: (day.exercises || []).map((exercise: Partial<IExercise>) => {
          const { ...exerciseRest } = exercise;
          if (exerciseRest._id?.startsWith("temp")) delete exerciseRest._id;
          return exerciseRest;
        }),
      };
    });

    try {
      await dispatch(
        updateRoutine({ name: routineName, _id: routineId, days: cleanedDays } as RoutineData)
      ).unwrap();
      navigate("/routine");
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setErrors({ routineName: "Error al guardar la rutina" });
        console.error(err);
      }
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleDelete = async () => {
    setDeletingRoutine(true);
    setErrors({});
    try {
      await dispatch(deleteRoutine(routineId!)).unwrap();
      navigate("/routine");
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setErrors({ routineName: "Error al eliminar la rutina" });
      }
    } finally {
      setDeletingRoutine(false);
    }
  };

  if (userLoading || routinesLoading || !initialRoutine) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center space-y-4">
        <Loader />
        <p className="text-[#E0E0E0] text-sm">Cargando rutina...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Editar Rutina: {routineName || "Sin nombre"}</h1>
          <Button
            variant="secondary"
            onClick={toggleAll}
            className="bg-[#FFD700] text-black hover:bg-[#FFC107] rounded-lg px-4 py-2 text-sm font-semibold border border-[#FFC107] shadow-md transition-colors flex items-center gap-2"
          >
            {allExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            {allExpanded ? "Colapsar Todo" : "Expandir Todo"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-4 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md">
            <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Nombre de la Rutina</label>
            <Input
              name="routineName"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="Ejemplo: Rutina de Fuerza"
              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
            />
            {errors.routineName && <p className="text-red-500 text-xs mt-1">{errors.routineName}</p>}
          </Card>

          <div className="flex flex-wrap gap-3 mb-8">
            {days.map((day, index) => (
              <div
                key={index}
                className={`text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 border ${
                  day.isOpen
                    ? "bg-[#34C759] text-black border-[#34C759]"
                    : "bg-[#4A4A4A] text-[#E0E0E0] border-[#5A5A5A] hover:ring-2 hover:ring-[#34C759]"
                }`}
                onClick={() => toggleDay(index)}
              >
                {day.dayName || `Día ${index + 1}`} ({day.exercises.length} ej.)
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => {
            const { circuits, standalone } = groupExercisesByCircuit(day.exercises);
            const circuitIds = getCircuitIdsForDay(dayIndex);

            return (
              <Card
                key={dayIndex}
                className={`p-4 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md transition-all duration-300 ${
                  day.isOpen ? "shadow-lg" : "shadow-sm"
                }`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer mb-4"
                  onClick={() => toggleDay(dayIndex)}
                >
                  <h2 className="text-lg sm:text-xl font-bold text-[#34C759]">
                    {day.dayName || `Día ${dayIndex + 1}`} ({day.exercises.length} ejercicios)
                  </h2>
                  <span className="text-[#34C759] text-sm font-bold">
                    {day.isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                  </span>
                </div>

                {day.isOpen && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Nombre del Día</label>
                        <Input
                          name={`dayName-${dayIndex}`}
                          value={day.dayName}
                          onChange={(e) => handleDayChange(dayIndex, "dayName", e.target.value)}
                          placeholder={`Día ${dayIndex + 1}`}
                          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
                        />
                        {errors.days?.[dayIndex]?.includes("nombre") && (
                          <p className="text-red-500 text-xs mt-1">El nombre del día es obligatorio</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Músculos Trabajados</label>
                        <Input
                          name={`musclesWorked-${dayIndex}`}
                          value={day.musclesWorked.join(", ")}
                          onChange={(e) => handleDayChange(dayIndex, "musclesWorked", e.target.value)}
                          placeholder="Pecho, Tríceps"
                          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Opciones de Calentamiento</label>
                        <Input
                          name={`warmupOptions-${dayIndex}`}
                          value={day.warmupOptions.join(", ")}
                          onChange={(e) => handleDayChange(dayIndex, "warmupOptions", e.target.value)}
                          placeholder="Caminadora, Estiramientos"
                          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Explicación</label>
                        <Input
                          name={`explanation-${dayIndex}`}
                          value={day.explanation}
                          onChange={(e) => handleDayChange(dayIndex, "explanation", e.target.value)}
                          placeholder="Notas sobre el día"
                          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Ejercicios sin circuito */}
                    {standalone.length > 0 && (
                      <Card className="p-4 bg-[#303030] border border-[#4A4A4A] rounded-lg shadow-sm">
                        <h3 className="text-sm font-semibold text-[#FFD700] mb-3">Ejercicios Individuales</h3>
                        <div className="space-y-4 divide-y divide-[#4A4A4A]">
                          {standalone.map((exercise, exerciseIndex) => (
                            <div key={exercise._id} className="pt-4 first:pt-0">
                              <Card
                                className={`p-4 bg-${
                                  exerciseIndex % 2 === 0 ? "[#252525]" : "[#282828]"
                                } border border-[#4A4A4A] rounded-lg transition-all duration-300 ${
                                  exercise.isOpen ? "shadow-md" : "shadow-sm"
                                }`}
                              >
                                <div
                                  className="flex justify-between items-center cursor-pointer mb-2"
                                  onClick={() => toggleExercise(dayIndex, exercise._id)}
                                >
                                  <h4 className="text-sm font-semibold text-[#1e88e5]">
                                    {exercise.name || `Ejercicio ${exerciseIndex + 1}`}
                                  </h4>
                                  <span className="text-[#34C759] text-sm font-bold">
                                    {exercise.isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                  </span>
                                </div>
                                {exercise.isOpen && (
                                  <ExerciseForm
                                    dayIndex={dayIndex}
                                    exercise={exercise}
                                    exerciseIndex={exerciseIndex}
                                    circuitIds={circuitIds}
                                    onChange={handleExerciseChange}
                                    onDelete={handleDeleteExercise}
                                    routineId={routineId!}
                                  />
                                )}
                              </Card>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Circuitos */}
                    {Object.entries(circuits).map(([circuitId, exercises], circuitIndex) => (
                      <Card
                        key={circuitId}
                        className={`p-4 bg-[${circuitColors[circuitIndex % circuitColors.length]}] border-2 border-[${circuitColors[circuitIndex % circuitColors.length]}] rounded-lg shadow-sm`}
                      >
                        <h3 className="text-sm font-semibold text-[#FFD700] mb-3">Circuito: {circuitId}</h3>
                        <div className="space-y-4 divide-y divide-[#4A4A4A]">
                          {exercises.map((exercise, exerciseIndex) => (
                            <div key={exercise._id} className="pt-4 first:pt-0">
                              <Card
                                className={`p-4 bg-${
                                  exerciseIndex % 2 === 0 ? "[#252525]" : "[#282828]"
                                } border border-[#4A4A4A] rounded-lg transition-all duration-300 ${
                                  exercise.isOpen ? "shadow-md" : "shadow-sm"
                                }`}
                              >
                                <div
                                  className="flex justify-between items-center cursor-pointer mb-2"
                                  onClick={() => toggleExercise(dayIndex, exercise._id)}
                                >
                                  <h4 className="text-sm font-semibold text-[#1e88e5]">
                                    {exercise.name || `Ejercicio ${exerciseIndex + 1}`}
                                  </h4>
                                  <span className="text-[#34C759] text-sm font-bold">
                                    {exercise.isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                  </span>
                                </div>
                                {exercise.isOpen && (
                                  <ExerciseForm
                                    dayIndex={dayIndex}
                                    exercise={exercise}
                                    exerciseIndex={exerciseIndex}
                                    circuitIds={circuitIds}
                                    onChange={handleExerciseChange}
                                    onDelete={handleDeleteExercise}
                                    routineId={routineId!}
                                  />
                                )}
                              </Card>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        type="button"
                        onClick={() => handleDeleteDay(dayIndex)}
                        disabled={days.length <= 1}
                        className="w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-2 px-4 text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
                      >
                        Eliminar Día
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => handleAddExercise(dayIndex)}
                        className="w-full bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-lg py-2 px-4 text-sm font-semibold border border-[#4CAF50] shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="w-5 h-5" /> Agregar Ejercicio
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          <Button
            variant="secondary"
            type="button"
            onClick={handleAddDay}
            disabled={addingDay}
            className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg py-3 px-4 text-sm font-semibold border border-[#1E88E5] shadow-md disabled:bg-[#1E88E5]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {addingDay ? <SmallLoader /> : <><PlusIcon className="w-5 h-5" /> Agregar Día</>}
          </Button>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={savingRoutine || deletingRoutine}
              className="w-full bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-lg py-3 px-4 text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
            >
              {savingRoutine ? <SmallLoader /> : "Guardar Rutina"}
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={savingRoutine || deletingRoutine}
              className="w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-3 px-4 text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
            >
              {deletingRoutine ? <SmallLoader /> : "Eliminar Rutina"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ExerciseFormProps {
  dayIndex: number;
  exercise: ExerciseFormData;
  exerciseIndex: number;
  circuitIds: string[];
  onChange: (dayIndex: number, exerciseId: string, field: string, value: string | number) => void;
  onDelete: (dayIndex: number, exerciseId: string) => void;
  routineId: string;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  dayIndex,
  exercise,
  exerciseIndex,
  circuitIds,
  onChange,
  onDelete,
  routineId,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Nombre del Ejercicio</label>
          <Input
            name={`exerciseName-${exercise._id}`}
            value={exercise.name}
            onChange={(e) => onChange(dayIndex, exercise._id, "name", e.target.value)}
            placeholder="Nombre del ejercicio"
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Circuito (opcional)</label>
          <select
            name={`circuitId-${exercise._id}`}
            value={exercise.circuitId || ""}
            onChange={(e) => onChange(dayIndex, exercise._id, "circuitId", e.target.value)}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
          >
            <option value="">Sin Circuito</option>
            {circuitIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
            <option value={`C${circuitIds.length + 1}`}>Nuevo: C{circuitIds.length + 1}</option>
          </select>
        </div>
        <div>
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Músculos Trabajados</label>
          <Input
            name={`muscleGroup-${exercise._id}`}
            value={exercise.muscleGroup.join(", ")}
            onChange={(e) => onChange(dayIndex, exercise._id, "muscleGroup", e.target.value)}
            placeholder="Músculos (ej. Pecho, Hombros)"
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Consejos</label>
          <Input
            name={`tips-${exercise._id}`}
            value={exercise.tips.join(", ")}
            onChange={(e) => onChange(dayIndex, exercise._id, "tips", e.target.value)}
            placeholder="Consejos (ej. Mantén la espalda recta)"
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Series</label>
          <Input
            name={`sets-${exercise._id}`}
            type="number"
            value={exercise.sets}
            onChange={(e) => onChange(dayIndex, exercise._id, "sets", Number(e.target.value))}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Repeticiones</label>
          <Input
            name={`reps-${exercise._id}`}
            type="number"
            value={exercise.reps}
            onChange={(e) => onChange(dayIndex, exercise._id, "reps", Number(e.target.value))}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Unidad Reps</label>
          <select
            name={`repsUnit-${exercise._id}`}
            value={exercise.repsUnit || "count"}
            onChange={(e) => onChange(dayIndex, exercise._id, "repsUnit", e.target.value)}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
          >
            <option value="count">Unidades (U)</option>
            <option value="seconds">Segundos (S)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Descanso (s)</label>
          <Input
            name={`rest-${exercise._id}`}
            type="number"
            value={exercise.rest}
            onChange={(e) => onChange(dayIndex, exercise._id, "rest", e.target.value)}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Notas</label>
          <Textarea
            name={`notes-${exercise._id}`}
            value={exercise.notes || ""}
            onChange={(e) => onChange(dayIndex, exercise._id, "notes", e.target.value)}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors h-20 resize-none"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          onClick={() => onDelete(dayIndex, exercise._id)}
          className="w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-2 px-4 text-sm font-semibold border border-[#D32F2F] shadow-md transition-colors"
        >
          Eliminar
        </Button>
        <Button
          type="button"
          onClick={() => navigate(`/routine-edit/${routineId}/videos/${dayIndex}/${exerciseIndex}`)}
          className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg py-2 px-4 text-sm font-semibold border border-[#1E88E5] shadow-md transition-colors"
        >
          Videos
        </Button>
      </div>
    </div>
  );
};