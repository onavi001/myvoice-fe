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
  const [error, setError] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);

  // Cargar las rutinas si no están disponibles
  useEffect(() => {
    if (token && !routines.length && !routinesLoading) {
      dispatch(fetchRoutines());
    }
    if (!token) {
      navigate("/login");
    }
  }, [token, routines, routinesLoading, dispatch, navigate]);

  // Actualizar estado local cuando cambie la rutina inicial
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
    if (!routineName || days.some((day) => !day.dayName || day.exercises.some((ex) => !ex.name))) {
      setError("Todos los campos obligatorios (nombre de rutina, días y ejercicios) deben estar completos");
      return;
    }

    setSavingRoutine(true);
    setError(null);

    const cleanedDays = days.map((day: Partial<IDay>) => {
      const { ...dayRest } = day;
      if (dayRest._id?.startsWith("temp")) delete dayRest._id;
      return {
        ...dayRest,
        exercises: (day.exercises || []).map((exercise:Partial<IExercise>) => {
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
        setError("Error al guardar la rutina");
        console.error(err);
      }
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleDelete = async () => {
    setDeletingRoutine(true);
    setError(null);
    try {
      await dispatch(deleteRoutine(routineId!)).unwrap();
      navigate("/routine");
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setError("Error al eliminar la rutina");
      }
    } finally {
      setDeletingRoutine(false);
    }
  };

  if (userLoading || routinesLoading || !initialRoutine) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center">
        <Loader />
        <p className="text-[#D1D1D1] text-xs mt-2">Cargando rutina...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <div className="p-4 max-w-2xl mx-auto flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-white">Editar Rutina: {routineName || "Sin nombre"}</h1>
          <Button
            variant="secondary"
            onClick={toggleAll}
            className="bg-[#FFD700] text-black hover:bg-[#FFC107] rounded-md py-1 px-2 text-xs font-semibold border border-[#FFC107] shadow-md"
          >
            {allExpanded ? "Colapsar Todo" : "Expandir Todo"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-4 bg-[#252525] border-2 border-[#4A4A4A] rounded-md">
            <label className="block text-[#D1D1D1] text-sm font-medium mb-2">Nombre de la Rutina</label>
            <Input
              name="routineName"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="Ejemplo: Rutina de Fuerza"
              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
            />
          </Card>

          {/* Resumen de días */}
          <div className="flex flex-wrap gap-2 mb-4">
            {days.map((day, index) => (
              <div
                key={index}
                className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer ${
                  day.isOpen ? "bg-[#34C759] text-black" : "bg-[#4A4A4A] text-white"
                }`}
                onClick={() => toggleDay(index)}
              >
                {day.dayName || `Día ${index + 1}`} ({day.exercises.length} ej.)
              </div>
            ))}
          </div>

          {/* Días */}
          {days.map((day, dayIndex) => {
            const { circuits, standalone } = groupExercisesByCircuit(day.exercises);
            const circuitIds = getCircuitIdsForDay(dayIndex);

            return (
              <Card
                key={dayIndex}
                className={`p-4 bg-[#252525] border-2 border-[#4A4A4A] rounded-md transition-all ${
                  day.isOpen ? "shadow-lg" : ""
                }`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer mb-2"
                  onClick={() => toggleDay(dayIndex)}
                >
                  <h2 className="text-lg font-bold text-[#34C759]">
                    {day.dayName || `Día ${dayIndex + 1}`} ({day.exercises.length} ejercicios)
                  </h2>
                  <span className="text-[#D1D1D1] text-sm">{day.isOpen ? "▲" : "▼"}</span>
                </div>

                {day.isOpen && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[#D1D1D1] text-sm font-medium mb-1">Nombre del Día</label>
                        <Input
                          name={`dayName-${dayIndex}`}
                          value={day.dayName}
                          onChange={(e) => handleDayChange(dayIndex, "dayName", e.target.value)}
                          placeholder={`Día ${dayIndex + 1}`}
                          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[#D1D1D1] text-sm font-medium mb-1">Músculos Trabajados</label>
                        <Input
                          name={`musclesWorked-${dayIndex}`}
                          value={day.musclesWorked.join(", ")}
                          onChange={(e) => handleDayChange(dayIndex, "musclesWorked", e.target.value)}
                          placeholder="Pecho, Tríceps"
                          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[#D1D1D1] text-sm font-medium mb-1">
                          Opciones de Calentamiento
                        </label>
                        <Input
                          name={`warmupOptions-${dayIndex}`}
                          value={day.warmupOptions.join(", ")}
                          onChange={(e) => handleDayChange(dayIndex, "warmupOptions", e.target.value)}
                          placeholder="Caminadora, Estiramientos"
                          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[#D1D1D1] text-sm font-medium mb-1">Explicación</label>
                        <Input
                          name={`explanation-${dayIndex}`}
                          value={day.explanation}
                          onChange={(e) => handleDayChange(dayIndex, "explanation", e.target.value)}
                          placeholder="Notas sobre el día"
                          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Circuitos */}
                    {Object.entries(circuits).map(([circuitId, exercises]) => (
                      <Card key={circuitId} className="p-3 bg-[#2D2D2D] border border-[#4A4A4A] rounded-md">
                        <h3 className="text-sm font-semibold text-[#FFD700] mb-2">Circuito: {circuitId}</h3>
                        <div className="space-y-3">
                          {exercises.map((exercise, exerciseIndex) => (
                            <Card
                              key={exercise._id}
                              className={`p-3 bg-[#252525] border border-[#4A4A4A] rounded-md ${
                                exercise.isOpen ? "shadow-md" : ""
                              }`}
                            >
                              <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleExercise(dayIndex, exercise._id)}
                              >
                                <h4 className="text-sm font-semibold text-white">
                                  {exercise.name || `Ejercicio ${exerciseIndex + 1}`}
                                </h4>
                                <span className="text-[#D1D1D1] text-xs">{exercise.isOpen ? "▲" : "▼"}</span>
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
                          ))}
                        </div>
                      </Card>
                    ))}

                    {/* Ejercicios sin circuito */}
                    {standalone.length > 0 && (
                      <Card className="p-3 bg-[#2D2D2D] border border-[#4A4A4A] rounded-md">
                        <h3 className="text-sm font-semibold text-[#FFD700] mb-2">Ejercicios Individuales</h3>
                        <div className="space-y-3">
                          {standalone.map((exercise, exerciseIndex) => (
                            <Card
                              key={exercise._id}
                              className={`p-3 bg-[#252525] border border-[#4A4A4A] rounded-md ${
                                exercise.isOpen ? "shadow-md" : ""
                              }`}
                            >
                              <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleExercise(dayIndex, exercise._id)}
                              >
                                <h4 className="text-sm font-semibold text-white">
                                  {exercise.name || `Ejercicio ${exerciseIndex + 1}`}
                                </h4>
                                <span className="text-[#D1D1D1] text-xs">{exercise.isOpen ? "▲" : "▼"}</span>
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
                          ))}
                        </div>
                      </Card>
                    )}

                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => handleAddExercise(dayIndex)}
                      className="w-full bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-md py-1 px-2 text-sm font-semibold border border-[#4CAF50] shadow-md"
                    >
                      + Agregar Ejercicio
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleDeleteDay(dayIndex)}
                      disabled={days.length <= 1}
                      className="w-full bg-[#EF5350] text-white hover:bg-[#D32F2F] rounded-md py-1 px-2 text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F] disabled:opacity-50"
                    >
                      Eliminar Día
                    </Button>
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
            className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-md py-2 px-4 text-sm font-semibold border border-[#1E88E5] shadow-md disabled:bg-[#1E88E5] disabled:opacity-50"
          >
            {addingDay ? <SmallLoader /> : "+ Agregar Día"}
          </Button>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={savingRoutine || deletingRoutine}
              className="w-1/2 bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-md py-2 px-4 text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50] disabled:opacity-50"
            >
              {savingRoutine ? <SmallLoader /> : "Guardar Rutina"}
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={savingRoutine || deletingRoutine}
              className="w-1/2 bg-[#EF5350] text-white hover:bg-[#D32F2F] rounded-md py-2 px-4 text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F] disabled:opacity-50"
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
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <Input
          name={`exerciseName-${exercise._id}`}
          value={exercise.name}
          onChange={(e) => onChange(dayIndex, exercise._id, "name", e.target.value)}
          placeholder="Nombre del ejercicio"
          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
        />
        <div>
          <label className="block text-[#D1D1D1] text-xs font-medium mb-1">Circuito (opcional)</label>
          <select
            name={`circuitId-${exercise._id}`}
            value={exercise.circuitId || ""}
            onChange={(e) => onChange(dayIndex, exercise._id, "circuitId", e.target.value)}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
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
        <Input
          name={`muscleGroup-${exercise._id}`}
          value={exercise.muscleGroup.join(", ")}
          onChange={(e) => onChange(dayIndex, exercise._id, "muscleGroup", e.target.value)}
          placeholder="Músculos (ej. Pecho, Hombros)"
          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
        />
        <Input
          name={`tips-${exercise._id}`}
          value={exercise.tips.join(", ")}
          onChange={(e) => onChange(dayIndex, exercise._id, "tips", e.target.value)}
          placeholder="Consejos (ej. Mantén la espalda recta)"
          className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[#D1D1D1] text-xs font-medium mb-1">Series</label>
          <Input
            name={`sets-${exercise._id}`}
            type="number"
            value={exercise.sets}
            onChange={(e) => onChange(dayIndex, exercise._id, "sets", Number(e.target.value))}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-[#D1D1D1] text-xs font-medium mb-1">Reps</label>
          <Input
            name={`reps-${exercise._id}`}
            type="number"
            value={exercise.reps}
            onChange={(e) => onChange(dayIndex, exercise._id, "reps", Number(e.target.value))}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-[#D1D1D1] text-xs font-medium mb-1">Descanso (s)</label>
          <Input
            name={`rest-${exercise._id}`}
            type="number"
            value={exercise.rest}
            onChange={(e) => onChange(dayIndex, exercise._id, "rest", e.target.value)}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          type="button"
          onClick={() => onDelete(dayIndex, exercise._id)}
          className="w-1/2 bg-[#EF5350] text-white hover:bg-[#D32F2F] rounded-md py-1 px-2 text-sm font-semibold border border-[#D32F2F] shadow-md"
        >
          Eliminar
        </Button>
        <Button
          type="button"
          onClick={() => navigate(`/routine-edit/${routineId}/videos/${dayIndex}/${exerciseIndex}`)}
          className="w-1/2 bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-md py-1 px-2 text-sm font-semibold border border-[#1E88E5] shadow-md"
        >
          Videos
        </Button>
      </div>
    </div>
  );
};