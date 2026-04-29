import { useEffect, useState, useCallback, useRef, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { updateRoutine, deleteRoutine, fetchRoutineById } from "../store/routineSlice";
import { IExercise } from "../models/Exercise";
import { IDay } from "../models/Day";
import { RoutineData } from "../models/Routine";
import { ExerciseFormData } from "../components/routine/RoutineExerciseForm";

export interface DayFormData extends IDay {
  isOpen: boolean;
  exercises: ExerciseFormData[];
}

export function useRoutineEditController() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const { routines, loading: routinesLoading, error: routinesError } = useSelector((state: RootState) => state.routine);
  const { token, loading: userLoading, user } = useSelector((state: RootState) => state.user);

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
  const deleteInFlightRef = useRef(false);
  const isDeletingRef = useRef(false);

  const isCoachRestricted: boolean = (initialRoutine?.couchId && initialRoutine.couchId !== user?._id) || false;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!initialRoutine && routineId && !routinesLoading && !fetchingRoutine && !hasFetched && !isDeletingRef.current) {
      setFetchingRoutine(true);
      dispatch(fetchRoutineById(routineId))
        .unwrap()
        .then(() => setHasFetched(true))
        .catch(() => undefined)
        .finally(() => setFetchingRoutine(false));
    }

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
    }
  }, [token, initialRoutine, routineId, routinesLoading, fetchingRoutine, hasFetched, dispatch, navigate]);

  useEffect(() => {
    if (!initialRoutine && !routinesLoading && !fetchingRoutine && routinesError && hasFetched) {
      navigate("/routine");
    }
  }, [initialRoutine, routinesLoading, fetchingRoutine, routinesError, hasFetched, navigate]);

  const handleAddDay = useCallback(() => {
    if (isCoachRestricted) return;
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
  }, [isCoachRestricted]);

  const handleAddExercise = useCallback((dayIndex: number) => {
    if (isCoachRestricted) return;
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
  }, [isCoachRestricted]);

  const handleDeleteExercise = useCallback((dayIndex: number, exerciseId: string) => {
    if (isCoachRestricted) return;
    setDays((prev) => {
      const updatedDays = [...prev];
      updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter((ex) => ex._id !== exerciseId);
      return updatedDays;
    });
  }, [isCoachRestricted]);

  const handleDeleteDay = useCallback((dayIndex: number) => {
    if (isCoachRestricted) return;
    setDays((prev) => prev.filter((_, index) => index !== dayIndex));
  }, [isCoachRestricted]);

  const handleDayChange = useCallback((dayIndex: number, field: string, value: string) => {
    if (isCoachRestricted) return;
    setDays((prev) => {
      const updatedDays = [...prev];
      if (field === "musclesWorked" || field === "warmupOptions") {
        updatedDays[dayIndex][field] = value.split(",").map((item) => item.trim());
      } else {
        updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
      }
      return updatedDays;
    });
  }, [isCoachRestricted]);

  const handleExerciseChange = useCallback((dayIndex: number, exerciseId: string, field: string, value: string | number) => {
    if (isCoachRestricted) return;
    setDays((prev) => {
      const updatedDays = structuredClone(prev);
      const exerciseIndex = updatedDays[dayIndex].exercises.findIndex((ex) => ex._id === exerciseId);
      if (exerciseIndex !== -1) {
        if (typeof value === "string" && (field === "muscleGroup" || field === "tips")) {
          updatedDays[dayIndex].exercises[exerciseIndex][field] = value.split(",").map((item) => item.trim());
        } else {
          updatedDays[dayIndex].exercises[exerciseIndex] = {
            ...updatedDays[dayIndex].exercises[exerciseIndex],
            [field]: value,
          };
        }
      }
      return updatedDays;
    });
  }, [isCoachRestricted]);

  const toggleDay = useCallback((dayIndex: number) => {
    setDays((prev) => {
      const updatedDays = structuredClone(prev);
      updatedDays[dayIndex].isOpen = !updatedDays[dayIndex].isOpen;
      return updatedDays;
    });
  }, []);

  const toggleExercise = useCallback((dayIndex: number, exerciseId: string) => {
    setDays((prev) => {
      const updatedDays = structuredClone(prev);
      const exerciseIndex = updatedDays[dayIndex].exercises.findIndex((ex) => ex._id === exerciseId);
      if (exerciseIndex !== -1) {
        updatedDays[dayIndex].exercises[exerciseIndex].isOpen = !updatedDays[dayIndex].exercises[exerciseIndex].isOpen;
      }
      return updatedDays;
    });
  }, []);

  const toggleAll = useCallback(() => {
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

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (isCoachRestricted) return;
    const newErrors: { routineName?: string; days?: string[] } = {};
    if (!routineName) newErrors.routineName = "El nombre de la rutina es obligatorio";
    const dayErrors = days
      .map((day, i) => {
        if (!day.dayName) return `El nombre del Día ${i + 1} es obligatorio`;
        if (day.exercises.some((ex) => !ex.name)) return `Todos los ejercicios del Día ${i + 1} deben tener un nombre`;
        return "";
      })
      .filter(Boolean);
    if (dayErrors.length) newErrors.days = dayErrors;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSavingRoutine(true);
    setErrors({});

    const cleanedDays = days.map((day: Partial<IDay>) => {
      const dayRest = { ...day };
      if (dayRest._id?.startsWith("temp")) delete dayRest._id;
      return {
        ...dayRest,
        exercises: (day.exercises || []).map((exercise: Partial<IExercise>) => {
          const exerciseRest = { ...exercise };
          if (exerciseRest._id?.startsWith("temp")) delete exerciseRest._id;
          return exerciseRest;
        }),
      };
    });

    try {
      await dispatch(updateRoutine({ name: routineName, _id: routineId, days: cleanedDays } as RoutineData)).unwrap();
      navigate("/routine");
    } catch (err) {
      const error = err as { message: string; status?: number };
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setErrors({ routineName: "Error al guardar la rutina" });
      }
    } finally {
      setSavingRoutine(false);
    }
  }, [isCoachRestricted, routineName, days, dispatch, routineId, navigate]);

  const handleDelete = useCallback(async () => {
    if (isCoachRestricted || deleteInFlightRef.current) return;
    deleteInFlightRef.current = true;
    isDeletingRef.current = true;
    setHasFetched(true);
    setDeletingRoutine(true);
    setErrors({});
    try {
      await dispatch(deleteRoutine(routineId!)).unwrap();
      navigate("/routine");
    } catch (err) {
      isDeletingRef.current = false;
      const error = err as { message: string; status?: number };
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setErrors({ routineName: "Error al eliminar la rutina" });
      }
    } finally {
      setDeletingRoutine(false);
      deleteInFlightRef.current = false;
    }
  }, [isCoachRestricted, dispatch, routineId, navigate]);

  return {
    routineId,
    routineName,
    setRoutineName,
    savingRoutine,
    deletingRoutine,
    addingDay,
    days,
    errors,
    allExpanded,
    fetchingRoutine,
    hasFetched,
    initialRoutine,
    routinesLoading,
    routinesError,
    userLoading,
    isCoachRestricted,
    handleAddDay,
    handleAddExercise,
    handleDeleteExercise,
    handleDeleteDay,
    handleDayChange,
    handleExerciseChange,
    toggleDay,
    toggleExercise,
    toggleAll,
    getCircuitIdsForDay,
    groupExercisesByCircuit,
    handleSubmit,
    handleDelete,
    navigate,
  };
}

