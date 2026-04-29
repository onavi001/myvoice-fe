import { useCallback, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { addProgress, deleteProgress, editProgress } from "../store/progressSlice";
import { ThunkError } from "../store/routineSlice";
import { ProgressData } from "../models/Progress";
import { useProgressBootstrap } from "./useProgressBootstrap";

type ToastState = { message: string; variant: "success" | "error" } | null;

const INITIAL_PROGRESS_FORM: Omit<ProgressData, "_id" | "userId"> = {
  exerciseName: "",
  sets: 0,
  reps: 0,
  repsUnit: "count",
  weightUnit: "kg",
  weight: 0,
  notes: "",
  date: new Date(),
  completed: false,
  dayName: "",
  routineId: "",
  dayId: "",
  routineName: "",
  exerciseId: "",
};

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function useProgressViewModel() {
  const {
    progress,
    progressLoading,
    routines,
    exerciseOptions,
    muscleOptions,
    routineLoading,
    userLoading,
    navigate,
    dispatch,
  } = useProgressBootstrap();

  const [toast, setToast] = useState<ToastState>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCardKey, setExpandedCardKey] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [chartMetric, setChartMetric] = useState<"weight" | "reps" | "sets">("weight");
  const [chartExercise, setChartExercise] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editData, setEditData] = useState<Record<string, Partial<ProgressData>>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newProgress, setNewProgress] = useState<Omit<ProgressData, "_id" | "userId">>(INITIAL_PROGRESS_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Omit<ProgressData, "_id" | "userId">, string>>>({});
  const [addingProgress, setAddingProgress] = useState(false);
  const [savingProgress, setSavingProgress] = useState<Record<string, boolean>>({});
  const [deletingProgress, setDeletingProgress] = useState<Record<string, boolean>>({});
  const [dateFilter, setDateFilter] = useState<{ start?: Date; end?: Date }>({});
  const [muscleFilter, setMuscleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "weight" | "reps">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleCloseToast = () => setToast(null);

  const toggleExpandCard = useCallback((key: string) => {
    setExpandedCardKey((prev) => (prev === key ? null : key));
  }, []);

  const handleEditChange = useCallback(
    (cardKey: string, field: keyof ProgressData, value: string | number | Date) => {
      setEditData((prev) => ({
        ...prev,
        [cardKey]: { ...prev[cardKey], [field]: value },
      }));
    },
    []
  );

  const handleSaveEdit = async (progressId: string) => {
    setSavingProgress((prev) => ({ ...prev, [progressId]: true }));
    const originalEntry = progress.find((p) => p._id === progressId);
    const updatedEntry = { ...originalEntry, ...editData[progressId] } as ProgressData;
    try {
      await dispatch(editProgress({ progressId, updatedEntry })).unwrap();
      setToast({ message: "Progreso actualizado correctamente", variant: "success" });
      setEditData((prev) => {
        const newData = { ...prev };
        delete newData[progressId];
        return newData;
      });
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      else setToast({ message: "Error al actualizar el progreso", variant: "error" });
    } finally {
      setSavingProgress((prev) => ({ ...prev, [progressId]: false }));
    }
  };

  const handleDelete = async (progressId: string) => {
    setDeletingProgress((prev) => ({ ...prev, [progressId]: true }));
    try {
      await dispatch(deleteProgress(progressId)).unwrap();
      setToast({ message: "Progreso eliminado correctamente", variant: "success" });
      setExpandedCardKey(null);
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      else setToast({ message: "Error al eliminar el progreso", variant: "error" });
    } finally {
      setDeletingProgress((prev) => ({ ...prev, [progressId]: false }));
    }
  };

  const validateForm = (data: Omit<ProgressData, "_id" | "userId">) => {
    const errors: Partial<Record<keyof Omit<ProgressData, "_id" | "userId">, string>> = {};
    if (!data.exerciseName) errors.exerciseName = "El nombre es obligatorio";
    if (data.sets < 0) errors.sets = "Series no pueden ser negativas";
    if (data.reps < 0) errors.reps = "Reps no pueden ser negativos";
    if (data.weight < 0) errors.weight = "Peso no puede ser negativo";
    return errors;
  };

  const handleAddChange = useCallback(
    (field: keyof Omit<ProgressData, "_id" | "userId">, value: string | number | Date) => {
      setNewProgress((prev) => {
        const updated = { ...prev, [field]: value };
        setFormErrors(validateForm(updated));
        return updated;
      });
    },
    []
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(newProgress);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setToast({ message: "Por favor corrige los errores en el formulario", variant: "error" });
      return;
    }
    setAddingProgress(true);
    try {
      await dispatch(addProgress(newProgress)).unwrap();
      setToast({ message: "Progreso agregado correctamente", variant: "success" });
      setShowAddForm(false);
      setNewProgress({ ...INITIAL_PROGRESS_FORM, date: new Date() });
      setFormErrors({});
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      else setToast({ message: "Error al agregar el progreso", variant: "error" });
    } finally {
      setAddingProgress(false);
    }
  };

  const handleExport = () => {
    const csvData = progress.map((entry) => ({
      Fecha: new Date(entry.date).toLocaleDateString(),
      Ejercicio: entry.exerciseName,
      Series: entry.sets,
      Reps: entry.reps,
      "Unidad Reps": entry.repsUnit,
      Peso: entry.weight,
      "Unidad Peso": entry.weightUnit,
      Notas: entry.notes,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "progress.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  const exercises = exerciseOptions;
  const muscles = muscleOptions;

  const filteredProgress = useMemo(() => {
    let result = [...progress];
    if (debouncedSearch) result = result.filter((entry) => entry.exerciseName.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (dateFilter.start) result = result.filter((entry) => new Date(entry.date) >= dateFilter.start!);
    if (dateFilter.end) result = result.filter((entry) => new Date(entry.date) <= dateFilter.end!);
    if (muscleFilter) {
      result = result.filter((entry) =>
        routines.some((routine) =>
          routine.days?.some((day) => day.exercises?.some((ex) => ex.name === entry.exerciseName && day.musclesWorked?.includes(muscleFilter)))
        )
      );
    }
    result.sort((a, b) => {
      const aValue = sortBy === "date" ? new Date(a.date).getTime() : a[sortBy];
      const bValue = sortBy === "date" ? new Date(b.date).getTime() : b[sortBy];
      return sortOrder === "asc" ? (aValue < bValue ? -1 : 1) : (bValue < aValue ? -1 : 1);
    });
    return result;
  }, [progress, debouncedSearch, dateFilter, muscleFilter, sortBy, sortOrder, routines]);

  const chartData = useMemo(() => {
    let data = chartExercise === "all" ? filteredProgress : filteredProgress.filter((e) => e.exerciseName === chartExercise);
    data = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      labels: data.map((entry) => new Date(entry.date).toLocaleDateString()),
      datasets: [{ label: chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1), data: data.map((entry) => entry[chartMetric]), borderColor: "#E0E0E0", backgroundColor: "rgba(224, 224, 224, 0.2)", fill: true }],
    };
  }, [filteredProgress, chartMetric, chartExercise]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: "#E0E0E0", font: { size: 12 } } },
      title: { display: true, text: `Progreso de ${chartMetric}`, color: "#E0E0E0", font: { size: 14 } },
      tooltip: { enabled: true },
      zoom: {
        zoom: { wheel: { enabled: true }, pinch: { enabled: false }, mode: "x" as const },
        pan: { enabled: true, mode: "x" as const },
      },
    },
    scales: {
      x: { ticks: { color: "#B0B0B0", font: { size: 12 } }, grid: { color: "#4A4A4A" } },
      y: { ticks: { color: "#B0B0B0", font: { size: 12 } }, grid: { color: "#4A4A4A" } },
    },
  };

  const totalPages = Math.ceil(filteredProgress.length / itemsPerPage);
  const paginatedProgress = filteredProgress.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return {
    progressLoading,
    routineLoading,
    userLoading,
    toast,
    handleCloseToast,
    showFilters,
    setShowFilters,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    muscleFilter,
    setMuscleFilter,
    showChart,
    setShowChart,
    chartMetric,
    setChartMetric,
    chartExercise,
    setChartExercise,
    exercises,
    muscles,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showAddForm,
    setShowAddForm,
    handleAddSubmit,
    newProgress,
    formErrors,
    addingProgress,
    handleAddChange,
    filteredProgress,
    chartData,
    chartOptions,
    paginatedProgress,
    expandedCardKey,
    editData,
    savingProgress,
    deletingProgress,
    toggleExpandCard,
    handleEditChange,
    handleSaveEdit,
    handleDelete,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    handleExport,
  };
}
