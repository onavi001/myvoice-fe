import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { addProgress, editProgress, deleteProgress, fetchProgress } from "../store/progressSlice";
import { fetchRoutines, ThunkError } from "../store/routineSlice";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import { ProgressData } from "../models/Progress";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Define props for ProgressCard
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

// Memoized ProgressCard component
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
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <div className="bg-[#252525] border border-[#3A3A3A] rounded-lg p-2 sm:p-3 overflow-hidden">
          <div
            className="flex justify-between items-center cursor-pointer hover:bg-[#2D2D2D] transition-colors"
            onClick={() => toggleExpandCard(cardKey)}
            role="button"
            aria-expanded={isExpanded}
            aria-label={`Toggle ${currentEntry.name} details`}
          >
            <div className="flex-1 truncate">
              <span className="text-base text-[#E0E0E0]">{currentEntry.name}</span>
              <p className="text-xs sm:text-sm text-[#B0B0B0]">
                {new Date(currentEntry.date).toLocaleDateString()}
              </p>
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
                    <Loader/>
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
                    <Loader/>
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

export default function Progress() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useSelector((state: RootState) => state.progress);
  const { routines, loading: routineLoading } = useSelector((state: RootState) => state.routine);
  const { token, loading: userLoading } = useSelector((state: RootState) => state.user);

  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
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
  const [newProgress, setNewProgress] = useState<Omit<ProgressData, "_id" | "userId">>({
    name: "",
    sets: 0,
    reps: 0,
    repsUnit: "count",
    weightUnit: "kg",
    weight: 0,
    notes: "",
    date: new Date(),
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Omit<ProgressData, "_id" | "userId">, string>>>({});
  const [addingProgress, setAddingProgress] = useState(false);
  const [savingProgress, setSavingProgress] = useState<Record<string, boolean>>({});
  const [deletingProgress, setDeletingProgress] = useState<Record<string, boolean>>({});
  const [dateFilter, setDateFilter] = useState<{ start?: Date; end?: Date }>({});
  const [muscleFilter, setMuscleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "weight" | "reps">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch data once on mount if token exists
  useEffect(() => {
    if (token && !progressLoading && !routineLoading) {
      dispatch(fetchRoutines());
      dispatch(fetchProgress());
    } else if (!token) {
      navigate("/login");
    }
  }, [token, dispatch, navigate]);

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
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setToast({ message: "Error al actualizar el progreso", variant: "error" });
      }
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
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setToast({ message: "Error al eliminar el progreso", variant: "error" });
      }
    } finally {
      setDeletingProgress((prev) => ({ ...prev, [progressId]: false }));
    }
  };

  const validateForm = (data: Omit<ProgressData, "_id" | "userId">) => {
    const errors: Partial<Record<keyof Omit<ProgressData, "_id" | "userId">, string>> = {};
    if (!data.name) errors.name = "El nombre es obligatorio";
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
      setNewProgress({
        name: "",
        sets: 0,
        reps: 0,
        repsUnit: "count",
        weightUnit: "kg",
        weight: 0,
        notes: "",
        date: new Date(),
      });
      setFormErrors({});
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setToast({ message: "Error al agregar el progreso", variant: "error" });
      }
    } finally {
      setAddingProgress(false);
    }
  };

  const handleExport = () => {
    const csvData = progress.map((entry) => ({
      Fecha: new Date(entry.date).toLocaleDateString(),
      Ejercicio: entry.name,
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

  const exercises = useMemo(() => {
    const uniqueExercises = new Set<string>();
    routines.forEach((routine) =>
      routine.days?.forEach((day) => day.exercises?.forEach((ex) => uniqueExercises.add(ex.name)))
    );
    return ["", ...Array.from(uniqueExercises).sort()];
  }, [routines]);

  const muscles = useMemo(() => {
    const uniqueMuscles = new Set<string>();
    routines.forEach((routine) =>
      routine.days?.forEach((day) => day.musclesWorked?.forEach((muscle) => uniqueMuscles.add(muscle)))
    );
    return ["", ...Array.from(uniqueMuscles).sort()];
  }, [routines]);

  const filteredProgress = useMemo(() => {
    let result = [...progress];
    if (debouncedSearch) {
      result = result.filter((entry) => entry.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    if (dateFilter.start) {
      result = result.filter((entry) => new Date(entry.date) >= dateFilter.start!);
    }
    if (dateFilter.end) {
      result = result.filter((entry) => new Date(entry.date) <= dateFilter.end!);
    }
    if (muscleFilter) {
      result = result.filter((entry) =>
        routines.some((routine) =>
          routine.days?.some((day) =>
            day.exercises?.some((ex) => ex.name === entry.name && day.musclesWorked?.includes(muscleFilter))
          )
        )
      );
    }
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = sortBy === "date" ? new Date(a.date).getTime() : a[sortBy];
        const bValue = sortBy === "date" ? new Date(b.date).getTime() : b[sortBy];
        return sortOrder === "asc" ? (aValue < bValue ? -1 : 1) : (bValue < aValue ? -1 : 1);
      });
    }
    return result;
  }, [progress, debouncedSearch, dateFilter, muscleFilter, sortBy, sortOrder, routines]);

  const chartData = useMemo(() => {
    let data = chartExercise === "all" ? filteredProgress : filteredProgress.filter((e) => e.name === chartExercise);
    data = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      labels: data.map((entry) => new Date(entry.date).toLocaleDateString()),
      datasets: [
        {
          label: chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1),
          data: data.map((entry) => entry[chartMetric]),
          borderColor: "#E0E0E0",
          backgroundColor: "rgba(224, 224, 224, 0.2)",
          fill: true,
        },
      ],
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
  const paginatedProgress = filteredProgress.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (userLoading || routineLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex items-center justify-center">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-3 sm:p-6 max-w-full mx-auto flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl text-[#E0E0E0]">Progreso</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors"
              aria-label="Export progress as CSV"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Exportar
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors sm:hidden"
              aria-label="Toggle filters"
            >
              <FunnelIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {showFilters ? "Ocultar Filtros" : "Filtros"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 640) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Input
                  name="search"
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] placeholder-[#B0B0B0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                  aria-label="Search exercises"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm text-[#E0E0E0]">Fecha Inicio</label>
                    <DatePicker
                      selected={dateFilter.start}
                      onChange={(date: Date | null) => setDateFilter((prev) => ({ ...prev, start: date || undefined }))}
                      className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                      placeholderText="Seleccionar"
                      isClearable
                      aria-label="Filter start date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-[#E0E0E0]">Fecha Fin</label>
                    <DatePicker
                      selected={dateFilter.end}
                      onChange={(date: Date | null) => setDateFilter((prev) => ({ ...prev, end: date || undefined }))}
                      className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                      placeholderText="Seleccionar"
                      isClearable
                      aria-label="Filter end date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-[#E0E0E0]">Músculo</label>
                    <select
                      value={muscleFilter}
                      onChange={(e) => setMuscleFilter(e.target.value)}
                      className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                      aria-label="Filter by muscle group"
                    >
                      {muscles.map((muscle) => (
                        <option key={muscle} value={muscle}>
                          {muscle || "Todos"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <label className="flex items-center text-xs sm:text-sm text-[#E0E0E0]">
                    <input
                      type="checkbox"
                      checked={showChart}
                      onChange={() => setShowChart(!showChart)}
                      className="mr-1 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 accent-[#E0E0E0] rounded"
                      aria-label="Toggle chart visibility"
                    />
                    <ChartBarIcon className="mr-1 w-3.5 h-3.5 sm:w-4 sm:h-4" /> Ver gráfica
                  </label>
                  {showChart && (
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                      <select
                        value={chartMetric}
                        onChange={(e) => setChartMetric(e.target.value as "weight" | "reps" | "sets")}
                        className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                        aria-label="Select chart metric"
                      >
                        <option value="weight">Peso</option>
                        <option value="reps">Reps</option>
                        <option value="sets">Series</option>
                      </select>
                      <select
                        value={chartExercise}
                        onChange={(e) => setChartExercise(e.target.value)}
                        className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                        aria-label="Filter chart by exercise"
                      >
                        <option value="all">Todos</option>
                        {exercises.filter((e) => e).map((exercise) => (
                          <option key={exercise} value={exercise}>
                            {exercise}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "date" | "weight" | "reps")}
                    className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    aria-label="Sort by"
                  >
                    <option value="date">Fecha</option>
                    <option value="weight">Peso</option>
                    <option value="reps">Reps</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                    className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    aria-label="Sort order"
                  >
                    <option value="asc">Ascendente</option>
                    <option value="desc">Descendente</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4">
          <div
            className="p-2 sm:p-3 cursor-pointer hover:bg-[#2D2D2D] transition-colors rounded-lg"
            onClick={() => setShowAddForm(!showAddForm)}
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
                <form onSubmit={handleAddSubmit} className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm text-[#E0E0E0]">Ejercicio</label>
                    <select
                      name="name"
                      value={newProgress.name}
                      onChange={(e) => handleAddChange("name", e.target.value)}
                      className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                      aria-label="Select exercise"
                    >
                      <option value="">Seleccionar ejercicio</option>
                      {exercises.filter((e) => e).map((exercise) => (
                        <option key={exercise} value={exercise}>
                          {exercise}
                        </option>
                      ))}
                    </select>
                    {formErrors.name && (
                      <p className="text-[#E0E0E0] text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm text-[#E0E0E0]">Series</label>
                      <Input
                        name="sets"
                        type="number"
                        value={newProgress.sets}
                        onChange={(e) => handleAddChange("sets", Number(e.target.value))}
                        className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                        min="0"
                        aria-label="Add sets"
                      />
                      {formErrors.sets && (
                        <p className="text-[#E0E0E0] text-xs mt-1">{formErrors.sets}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-[#E0E0E0]">Reps</label>
                      <Input
                        name="reps"
                        type="number"
                        value={newProgress.reps}
                        onChange={(e) => handleAddChange("reps", Number(e.target.value))}
                        className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                        min="0"
                        aria-label="Add reps"
                      />
                      {formErrors.reps && (
                        <p className="text-[#E0E0E0] text-xs mt-1">{formErrors.reps}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-[#E0E0E0]">Unidad Reps</label>
                      <select
                        name="repsUnit"
                        value={newProgress.repsUnit}
                        onChange={(e) => handleAddChange("repsUnit", e.target.value)}
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
                        onChange={(e) => handleAddChange("weight", Number(e.target.value))}
                        className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                        min="0"
                        step="0.1"
                        aria-label="Add weight"
                      />
                      {formErrors.weight && (
                        <p className="text-[#E0E0E0] text-xs mt-1">{formErrors.weight}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-[#E0E0E0]">Unidad Peso</label>
                      <select
                        name="weightUnit"
                        value={newProgress.weightUnit}
                        onChange={(e) => handleAddChange("weightUnit", e.target.value)}
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
                      onChange={(e) => handleAddChange("notes", e.target.value)}
                      className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-16 resize-none focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                      aria-label="Add notes"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-[#E0E0E0]">Fecha</label>
                    <DatePicker
                      selected={newProgress.date instanceof Date ? newProgress.date : new Date()}
                      onChange={(date: Date | null) => handleAddChange("date", date || new Date())}
                      className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                      dateFormat="yyyy-MM-dd"
                      aria-label="Add progress date"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={addingProgress}
                      className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      aria-label="Save new progress"
                    >
                      {addingProgress ? (
                        <Loader/>
                      ) : (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Guardar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowAddForm(false)}
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

        {showChart && filteredProgress.length > 0 && (
          <div className="mt-4 bg-[#252525] border border-[#3A3A3A] rounded-lg p-2 sm:p-3 h-64 sm:h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {filteredProgress.length === 0 ? (
          <p className="text-[#B0B0B0] text-xs sm:text-sm mt-4 text-center">No hay progreso registrado con este filtro.</p>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              {paginatedProgress.map((entry, index) => (
                <ProgressCard
                  key={entry._id}
                  entry={entry}
                  index={index}
                  expandedCardKey={expandedCardKey}
                  editData={editData}
                  savingProgress={savingProgress}
                  deletingProgress={deletingProgress}
                  toggleExpandCard={toggleExpandCard}
                  handleEditChange={handleEditChange}
                  handleSaveEdit={handleSaveEdit}
                  handleDelete={handleDelete}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    aria-label="Items per page"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                  <span className="text-xs sm:text-sm text-[#B0B0B0]">por página</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg disabled:opacity-50 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors flex items-center justify-center gap-2"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Input
                    name="page"
                    type="number"
                    value={currentPage}
                    onChange={(e) => {
                      const page = Number(e.target.value);
                      if (page >= 1 && page <= totalPages) setCurrentPage(page);
                    }}
                    className="w-16 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-center h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                    aria-label="Jump to page"
                  />
                  <span className="text-xs sm:text-sm text-[#B0B0B0]">de {totalPages}</span>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg disabled:opacity-50 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors flex items-center justify-center gap-2"
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        {toast && <Toast type={toast.variant} message={toast.message} onClose={handleCloseToast} />}
      </div>
    </div>
  );
}