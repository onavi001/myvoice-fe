import React, { useEffect, useState, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { AppDispatch, RootState } from "../store";
import { updateRoutine, deleteRoutine, fetchRoutineById } from "../store/routineSlice";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Loader, { SmallLoader } from "../components/Loader";
import { IExercise } from "../models/Exercise";
import { IDay } from "../models/Day";
import { RoutineData } from "../models/Routine";
import Textarea from "../components/Textarea";
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, ExclamationCircleIcon } from "@heroicons/react/20/solid";

interface ExerciseFormData extends IExercise {
  isOpen: boolean;
}

interface DayFormData extends IDay {
  isOpen: boolean;
  exercises: ExerciseFormData[];
}

const RoutineEdit: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const { routines, loading: routinesLoading, error: routinesError } = useSelector((state: RootState) => state.routine);
  const { token, loading: userLoading } = useSelector((state: RootState) => state.user);

  const initialRoutine = routines.find((r) => r._id === routineId);
  const [routineName, setRoutineName] = useState("");
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [deletingRoutine, setDeletingRoutine] = useState(false);
  const [addingDay, setAddingDay] = useState(false);
  const [days, setDays] = useState<DayFormData[]>([]);
  const [errors, setErrors] = useState<{ routineName?: string; days?: string[] }>({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [fetchingRoutine, setFetchingRoutine] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Brighter circuit colors for better contrast
  const circuitColors = ["#4CAF50", "#AB47BC", "#42A5F5", "#FFCA28", "#EF5350"];

  useEffect(() => {
    if (!token) {
      console.log("No token, redirecting to /login");
      navigate("/login");
      return;
    }

    if (!initialRoutine && routineId && !routinesLoading && !fetchingRoutine && !hasFetched) {
      console.log("Fetching routine by ID:", routineId);
      setFetchingRoutine(true);
      dispatch(fetchRoutineById(routineId))
        .unwrap()
        .then(() => setHasFetched(true))
        .catch((err) => console.error("Fetch routine failed:", err))
        .finally(() => setFetchingRoutine(false));
    }

    if (initialRoutine) {
      console.log("Updating state with initialRoutine:", initialRoutine._id);
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
    }
  }, [token, initialRoutine, routineId, routinesLoading, fetchingRoutine, hasFetched, dispatch, navigate]);

  useEffect(() => {
    if (!initialRoutine && !routinesLoading && !fetchingRoutine && routinesError && hasFetched) {
      console.log("Redirecting to /routine due to error:", routinesError);
      navigate("/routine");
    }
  }, [initialRoutine, routinesLoading, fetchingRoutine, routinesError, hasFetched, navigate]);

  const handleAddDay = useCallback(() => {
    console.log("Adding new day");
    setAddingDay(true);
    setDays((prev) => [
      ...prev,
      {
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dayName: `Día ${prev.length + 1}`,
        musclesWorked: [],
        warmupOptions: [],
        explanation: "",
        exercises: [],
        isOpen: true,
      },
    ]);
    setAddingDay(false);
  }, []);

  const handleAddExercise = useCallback((dayIndex: number) => {
    console.log("Adding exercise to day:", dayIndex);
    setDays((prev) => {
      const updatedDays = [...prev];
      updatedDays[dayIndex].exercises = [
        ...updatedDays[dayIndex].exercises,
        {
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
        },
      ];
      return updatedDays;
    });
  }, []);

  const handleDeleteExercise = useCallback((dayIndex: number, exerciseId: string) => {
    console.log("Deleting exercise:", exerciseId, "from day:", dayIndex);
    setDays((prev) => {
      const updatedDays = [...prev];
      updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter(
        (ex) => ex._id !== exerciseId
      );
      return updatedDays;
    });
  }, []);

  const handleDeleteDay = useCallback((dayIndex: number) => {
    console.log("Deleting day:", dayIndex);
    setDays((prev) => prev.filter((_, index) => index !== dayIndex));
  }, []);

  const handleDayChange = useCallback((dayIndex: number, field: string, value: string) => {
    console.log("Updating day:", dayIndex, "field:", field, "value:", value);
    setDays((prev) => {
      const updatedDays = [...prev];
      if (field === "musclesWorked" || field === "warmupOptions") {
        updatedDays[dayIndex][field] = value.split(",").map((item) => item.trim());
      } else {
        updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
      }
      return updatedDays;
    });
  }, []);

  const handleExerciseChange = useCallback(
    (dayIndex: number, exerciseId: string, field: string, value: string | number) => {
      console.log("Updating exercise:", exerciseId, "field:", field, "value:", value);
      setDays((prev) => {
        const updatedDays = structuredClone(prev);
        const exerciseIndex = updatedDays[dayIndex].exercises.findIndex((ex) => ex._id === exerciseId);
        if (exerciseIndex !== -1) {
          if (typeof value === "string" && (field === "muscleGroup" || field === "tips")) {
            updatedDays[dayIndex].exercises[exerciseIndex][field] = value
              .split(",")
              .map((item) => item.trim());
          } else {
            updatedDays[dayIndex].exercises[exerciseIndex] = {
              ...updatedDays[dayIndex].exercises[exerciseIndex],
              [field]: value,
            };
          }
        }
        console.log("Updated days after exercise change:", updatedDays);
        return updatedDays;
      });
    },
    []
  );

  const toggleDay = useCallback((dayIndex: number) => {
    console.log("Toggling day:", dayIndex);
    setDays((prev) => {
      const updatedDays = structuredClone(prev);
      updatedDays[dayIndex].isOpen = !updatedDays[dayIndex].isOpen;
      console.log("Updated days after toggleDay:", updatedDays);
      return updatedDays;
    });
  }, []);

  const toggleExercise = useCallback((dayIndex: number, exerciseId: string) => {
    console.log("Toggling exercise:", exerciseId, "in day:", dayIndex);
    setDays((prev) => {
      const updatedDays = structuredClone(prev);
      const exerciseIndex = updatedDays[dayIndex].exercises.findIndex((ex) => ex._id === exerciseId);
      if (exerciseIndex !== -1) {
        updatedDays[dayIndex].exercises[exerciseIndex].isOpen =
          !updatedDays[dayIndex].exercises[exerciseIndex].isOpen;
      }
      console.log("Updated days after toggleExercise:", updatedDays);
      return updatedDays;
    });
  }, []);

  const toggleAll = useCallback(() => {
    console.log("Toggling all days and exercises");
    setAllExpanded((prev) => {
      const newState = !prev;
      setDays((prevDays) => {
        const updatedDays = structuredClone(prevDays);
        updatedDays.forEach((day) => {
          day.isOpen = newState;
          day.exercises.forEach((ex) => {
            ex.isOpen = newState;
          });
        });
        console.log("Updated days after toggleAll:", updatedDays);
        return updatedDays;
      });
      return newState;
    });
  }, []);

  const getCircuitIdsForDay = useCallback((dayIndex: number) => {
    const circuitIds = new Set<string>();
    days[dayIndex]?.exercises.forEach((ex) => {
      if (ex.circuitId) circuitIds.add(ex.circuitId);
    });
    return Array.from(circuitIds);
  }, [days]);

  const groupExercisesByCircuit = useCallback((exercises: ExerciseFormData[]) => {
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
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: { routineName?: string; days?: string[] } = {};
      if (!routineName) newErrors.routineName = "El nombre de la rutina es obligatorio";
      const dayErrors = days.map((day, i) => {
        if (!day.dayName) return `El nombre del Día ${i + 1} es obligatorio`;
        if (day.exercises.some((ex) => !ex.name))
          return `Todos los ejercicios del Día ${i + 1} deben tener un nombre`;
        return "";
      }).filter(Boolean);
      if (dayErrors.length) newErrors.days = dayErrors;

      if (Object.keys(newErrors).length) {
        console.log("Validation errors:", newErrors);
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
        console.log("Submitting routine:", { name: routineName, _id: routineId, days: cleanedDays });
        await dispatch(
          updateRoutine({ name: routineName, _id: routineId, days: cleanedDays } as RoutineData)
        ).unwrap();
        navigate("/routine");
      } catch (err) {
        const error = err as { message: string; status?: number };
        if (error.message === "Unauthorized" && error.status === 401) {
          console.log("Unauthorized, redirecting to /login");
          navigate("/login");
        } else {
          console.log("Submit error:", error);
          setErrors({ routineName: "Error al guardar la rutina" });
        }
      } finally {
        setSavingRoutine(false);
      }
    },
    [routineName, days, routineId, dispatch, navigate]
  );

  const handleDelete = useCallback(async () => {
    console.log("Deleting routine:", routineId);
    setDeletingRoutine(true);
    setErrors({});
    try {
      await dispatch(deleteRoutine(routineId!)).unwrap();
      navigate("/routine");
    } catch (err) {
      const error = err as { message: string; status?: number };
      if (error.message === "Unauthorized" && error.status === 401) {
        console.log("Unauthorized, redirecting to /login");
        navigate("/login");
      } else {
        console.log("Delete error:", error);
        setErrors({ routineName: "Error al eliminar la rutina" });
      }
    } finally {
      setDeletingRoutine(false);
    }
  }, [routineId, dispatch, navigate]);

  if (userLoading || routinesLoading || fetchingRoutine) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center space-y-4">
        <Loader />
        <p className="text-[#E0E0E0] text-sm">Cargando rutina...</p>
      </div>
    );
  }

  if (!initialRoutine && !fetchingRoutine && routinesError && hasFetched) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center space-y-4">
        <p className="text-[#EF5350] text-sm">Error al cargar la rutina</p>
        <Button
          onClick={() => navigate("/routine")}
          className="bg-[#34C759] text-black hover:bg-[#4CAF50] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4CAF50] shadow-md transition-colors"
        >
          Volver a Rutinas
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-3 sm:p-6 max-w-3xl mx-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#FFD700]">
            Editar Rutina: {routineName || "Sin nombre"}
          </h1>
          <Button
            variant="secondary"
            onClick={toggleAll}
            className="bg-[#FFD700] text-black hover:bg-[#FFC107] rounded-lg px-4 py-2 text-sm font-semibold border border-[#FFC107] shadow-md transition-colors flex items-center gap-2 min-h-12"
          >
            {allExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            {allExpanded ? "Colapsar Todo" : "Expandir Todo"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md">
            <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Nombre de la Rutina</label>
            <Input
              name="routineName"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="Ejemplo: Rutina de Fuerza"
              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
            />
            {errors.routineName && (
              <p className="text-[#EF5350] text-xs mt-1 flex items-center gap-1">
                <ExclamationCircleIcon className="w-4 h-4" /> {errors.routineName}
              </p>
            )}
          </Card>

          <motion.div
            className="flex flex-wrap gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {days.map((day, index) => (
              <motion.div
                key={day._id}
                className={`text-sm font-semibold px-3 py-2 rounded-full cursor-pointer transition-all duration-200 border ${
                  day.isOpen
                    ? "bg-[#34C759] text-black border-[#34C759]"
                    : "bg-[#4A4A4A] text-[#E0E0E0] border-[#5A5A5A] hover:ring-2 hover:ring-[#34C759]"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDay(index);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {day.dayName || `Día ${index + 1}`} ({day.exercises.length} ej.)
              </motion.div>
            ))}
          </motion.div>

          <AnimatePresence>
            {days.map((day, dayIndex) => {
              const { circuits, standalone } = groupExercisesByCircuit(day.exercises);
              const circuitIds = getCircuitIdsForDay(dayIndex);

              return (
                <motion.div
                  key={day._id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md transition-all duration-300 ${
                      day.isOpen ? "shadow-lg" : "shadow-sm"
                    }`}
                  >
                    <motion.div
                      className="flex justify-between items-center cursor-pointer mb-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDay(dayIndex);
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <h2 className="text-lg sm:text-xl font-bold text-[#34C759]">
                        {day.dayName || `Día ${dayIndex + 1}`} ({day.exercises.length} ejercicios)
                      </h2>
                      <span className="text-[#34C759] text-sm font-bold">
                        {day.isOpen ? (
                          <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5" />
                        )}
                      </span>
                    </motion.div>

                    {day.isOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                              Nombre del Día
                            </label>
                            <Input
                              name={`dayName-${dayIndex}`}
                              value={day.dayName}
                              onChange={(e) => handleDayChange(dayIndex, "dayName", e.target.value)}
                              placeholder={`Día ${dayIndex + 1}`}
                              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                            />
                            {errors.days?.[dayIndex]?.includes("nombre") && (
                              <p className="text-[#EF5350] text-xs mt-1 flex items-center gap-1">
                                <ExclamationCircleIcon className="w-4 h-4" /> El nombre del día es
                                obligatorio
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                              Músculos Trabajados
                            </label>
                            <Input
                              name={`musclesWorked-${dayIndex}`}
                              value={day.musclesWorked.join(", ")}
                              onChange={(e) =>
                                handleDayChange(dayIndex, "musclesWorked", e.target.value)
                              }
                              placeholder="Pecho, Tríceps"
                              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                            />
                          </div>
                          <div>
                            <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                              Opciones de Calentamiento
                            </label>
                            <Input
                              name={`warmupOptions-${dayIndex}`}
                              value={day.warmupOptions.join(", ")}
                              onChange={(e) =>
                                handleDayChange(dayIndex, "warmupOptions", e.target.value)
                              }
                              placeholder="Caminadora, Estiramientos"
                              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                            />
                          </div>
                          <div>
                            <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                              Explicación
                            </label>
                            <Input
                              name={`explanation-${dayIndex}`}
                              value={day.explanation}
                              onChange={(e) =>
                                handleDayChange(dayIndex, "explanation", e.target.value)
                              }
                              placeholder="Notas sobre el día"
                              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                            />
                          </div>
                        </div>

                        {standalone.length > 0 && (
                          <Card className="p-3 bg-[#303030] border border-[#4A4A4A] rounded-lg shadow-sm">
                            <h3 className="text-sm font-semibold text-[#FFD700] mb-3">
                              Ejercicios Individuales
                            </h3>
                            <div className="space-y-3 divide-y divide-[#4A4A4A]">
                              {standalone.map((exercise, exerciseIndex) => (
                                <ExerciseForm
                                  key={exercise._id}
                                  dayIndex={dayIndex}
                                  exercise={exercise}
                                  exerciseIndex={exerciseIndex}
                                  circuitIds={circuitIds}
                                  onChange={handleExerciseChange}
                                  onDelete={handleDeleteExercise}
                                  onToggle={() => toggleExercise(dayIndex, exercise._id)}
                                  routineId={routineId!}
                                />
                              ))}
                            </div>
                          </Card>
                        )}

                        {Object.entries(circuits).map(([circuitId, exercises], circuitIndex) => (
                          <Card
                            key={circuitId}
                            className={`p-3 bg-[${
                              circuitColors[circuitIndex % circuitColors.length]
                            }] border-2 border-[${
                              circuitColors[circuitIndex % circuitColors.length]
                            }] rounded-lg shadow-sm`}
                          >
                            <h3 className="text-sm font-semibold text-[#FFD700] mb-3">
                              Circuito: {circuitId}
                            </h3>
                            <div className="space-y-3 divide-y divide-[#4A4A4A]">
                              {exercises.map((exercise, exerciseIndex) => (
                                <ExerciseForm
                                  key={exercise._id}
                                  dayIndex={dayIndex}
                                  exercise={exercise}
                                  exerciseIndex={exerciseIndex}
                                  circuitIds={circuitIds}
                                  onChange={handleExerciseChange}
                                  onDelete={handleDeleteExercise}
                                  onToggle={() => toggleExercise(dayIndex, exercise._id)}
                                  routineId={routineId!}
                                />
                              ))}
                            </div>
                          </Card>
                        ))}

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            type="button"
                            onClick={() => handleDeleteDay(dayIndex)}
                            disabled={days.length <= 1}
                            className="w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-2 px-4 text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12"
                          >
                            Eliminar Día
                          </Button>
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => handleAddExercise(dayIndex)}
                            className="w-full bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-lg py-2 px-4 text-sm font-semibold border border-[#4CAF50] shadow-md transition-colors flex items-center justify-center gap-2 min-h-12"
                          >
                            <PlusIcon className="w-5 h-5" /> Agregar Ejercicio
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <Button
            variant="secondary"
            type="button"
            onClick={handleAddDay}
            disabled={addingDay}
            className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg py-3 px-4 text-sm font-semibold border border-[#1E88E5] shadow-md disabled:bg-[#1E88E5]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-12"
          >
            {addingDay ? <SmallLoader /> : (
              <>
                <PlusIcon className="w-5 h-5" /> Agregar Día
              </>
            )}
          </Button>

          <div className="mt-6 p-3 sm:p-0">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={savingRoutine || deletingRoutine}
                className="w-full bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-lg py-3 px-4 text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12"
              >
                {savingRoutine ? <SmallLoader /> : "Guardar Rutina"}
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={savingRoutine || deletingRoutine}
                className="w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-3 px-4 text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12"
              >
                {deletingRoutine ? <SmallLoader /> : "Eliminar Rutina"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ExerciseFormProps {
  dayIndex: number;
  exercise: ExerciseFormData;
  exerciseIndex: number;
  circuitIds: string[];
  onChange: (dayIndex: number, exerciseId: string, field: string, value: string | number) => void;
  onDelete: (dayIndex: number, exerciseId: string) => void;
  onToggle: () => void;
  routineId: string;
}

const ExerciseForm = memo(
  ({ dayIndex, exercise, exerciseIndex, circuitIds, onChange, onDelete, onToggle, routineId }: ExerciseFormProps) => {
    const navigate = useNavigate();

    return (
      <motion.div
        className="pt-3 first:pt-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`p-3 bg-${
            exerciseIndex % 2 === 0 ? "[#252525]" : "[#282828]"
          } border border-[#4A4A4A] rounded-lg transition-all duration-300 ${
            exercise.isOpen ? "shadow-md" : "shadow-sm"
          }`}
        >
          <motion.div
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="text-sm font-semibold text-[#42A5F5]">
              {exercise.name || `Ejercicio ${exerciseIndex + 1}`}
            </h4>
            <span className="text-[#34C759] text-sm font-bold">
              {exercise.isOpen ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </span>
          </motion.div>
          {exercise.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-3 space-y-3"
            >
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                    Nombre del Ejercicio
                  </label>
                  <Input
                    name={`exerciseName-${exercise._id}`}
                    value={exercise.name}
                    onChange={(e) => onChange(dayIndex, exercise._id, "name", e.target.value)}
                    placeholder="Nombre del ejercicio"
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                  />
                </div>
                <div>
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                    Circuito (opcional)
                  </label>
                  <select
                    name={`circuitId-${exercise._id}`}
                    value={exercise.circuitId || ""}
                    onChange={(e) => onChange(dayIndex, exercise._id, "circuitId", e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                  >
                    <option value="">Sin Circuito</option>
                    {circuitIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                    <option value={`C${circuitIds.length + 1}`}>
                      Nuevo: C{circuitIds.length + 1}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                    Músculos Trabajados
                  </label>
                  <Input
                    name={`muscleGroup-${exercise._id}`}
                    value={exercise.muscleGroup.join(", ")}
                    onChange={(e) => onChange(dayIndex, exercise._id, "muscleGroup", e.target.value)}
                    placeholder="Músculos (ej. Pecho, Hombros)"
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                  />
                </div>
                <div>
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">Consejos</label>
                  <Input
                    name={`tips-${exercise._id}`}
                    value={exercise.tips.join(", ")}
                    onChange={(e) => onChange(dayIndex, exercise._id, "tips", e.target.value)}
                    placeholder="Consejos (ej. Mantén la espalda recta)"
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">Series</label>
                  <Input
                    name={`sets-${exercise._id}`}
                    type="number"
                    value={exercise.sets}
                    onChange={(e) =>
                      onChange(dayIndex, exercise._id, "sets", Number(e.target.value))
                    }
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                  />
                </div>
                <div>
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">Repeticiones</label>
                  <Input
                    name={`reps-${exercise._id}`}
                    type="number"
                    value={exercise.reps}
                    onChange={(e) =>
                      onChange(dayIndex, exercise._id, "reps", Number(e.target.value))
                    }
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                  />
                </div>
                <div>
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                    Unidad Reps
                  </label>
                  <select
                    name={`repsUnit-${exercise._id}`}
                    value={exercise.repsUnit || "count"}
                    onChange={(e) => onChange(dayIndex, exercise._id, "repsUnit", e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                  >
                    <option value="count">Unidades (U)</option>
                    <option value="seconds">Segundos (S)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">
                    Descanso (s)
                  </label>
                  <Input
                    name={`rest-${exercise._id}`}
                    type="number"
                    value={exercise.rest}
                    onChange={(e) => onChange(dayIndex, exercise._id, "rest", e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors min-h-12"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#E0E0E0] text-sm font-medium mb-1">Notas</label>
                  <Textarea
                    name={`notes-${exercise._id}`}
                    value={exercise.notes || ""}
                    onChange={(e) => onChange(dayIndex, exercise._id, "notes", e.target.value)}
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors h-20 resize-none"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={() => onDelete(dayIndex, exercise._id)}
                  className="w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-2 px-4 text-sm font-semibold border border-[#D32F2F] shadow-md transition-colors min-h-12"
                >
                  Eliminar
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    navigate(`/routine-edit/${routineId}/videos/${dayIndex}/${exerciseIndex}`)
                  }
                  className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg py-2 px-4 text-sm font-semibold border border-[#1E88E5] shadow-md transition-colors min-h-12"
                >
                  Videos
                </Button>
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
    prevProps.onToggle === nextProps.onToggle
);

export default RoutineEdit;