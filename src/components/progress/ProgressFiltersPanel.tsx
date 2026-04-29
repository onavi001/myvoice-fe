import { AnimatePresence, motion } from "framer-motion";
import DatePicker from "react-datepicker";
import Input from "../Input";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface ProgressFiltersPanelProps {
  showFilters: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateFilter: { start?: Date; end?: Date };
  onDateFilterChange: (next: { start?: Date; end?: Date }) => void;
  muscleFilter: string;
  muscles: string[];
  onMuscleFilterChange: (value: string) => void;
  showChart: boolean;
  onToggleChart: () => void;
  chartMetric: "weight" | "reps" | "sets";
  onChartMetricChange: (value: "weight" | "reps" | "sets") => void;
  chartExercise: string;
  onChartExerciseChange: (value: string) => void;
  exercises: string[];
  sortBy: "date" | "weight" | "reps";
  onSortByChange: (value: "date" | "weight" | "reps") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
}

export default function ProgressFiltersPanel({
  showFilters,
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  muscleFilter,
  muscles,
  onMuscleFilterChange,
  showChart,
  onToggleChart,
  chartMetric,
  onChartMetricChange,
  chartExercise,
  onChartExerciseChange,
  exercises,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: ProgressFiltersPanelProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`space-y-2 ${showFilters ? "block" : "hidden sm:block"}`}
      >
        <Input
          name="search"
          type="text"
          placeholder="Buscar ejercicio..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] placeholder-[#B0B0B0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
          aria-label="Search exercises"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs sm:text-sm text-[#E0E0E0]">Fecha Inicio</label>
            <DatePicker
              selected={dateFilter.start}
              onChange={(date: Date | null) => onDateFilterChange({ ...dateFilter, start: date || undefined })}
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
              onChange={(date: Date | null) => onDateFilterChange({ ...dateFilter, end: date || undefined })}
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
              onChange={(e) => onMuscleFilterChange(e.target.value)}
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
              onChange={onToggleChart}
              className="mr-1 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 accent-[#E0E0E0] rounded"
              aria-label="Toggle chart visibility"
            />
            <ChartBarIcon className="mr-1 w-3.5 h-3.5 sm:w-4 sm:h-4" /> Ver gráfica
          </label>
          {showChart && (
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <select
                value={chartMetric}
                onChange={(e) => onChartMetricChange(e.target.value as "weight" | "reps" | "sets")}
                className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                aria-label="Select chart metric"
              >
                <option value="weight">Peso</option>
                <option value="reps">Reps</option>
                <option value="sets">Series</option>
              </select>
              <select
                value={chartExercise}
                onChange={(e) => onChartExerciseChange(e.target.value)}
                className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                aria-label="Filter chart by exercise"
              >
                <option value="all">Todos</option>
                {exercises.filter((exercise) => exercise).map((exercise) => (
                  <option key={exercise} value={exercise}>
                    {exercise}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as "date" | "weight" | "reps")}
            className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
            aria-label="Sort by"
          >
            <option value="date">Fecha</option>
            <option value="weight">Peso</option>
            <option value="reps">Reps</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
            className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
            aria-label="Sort order"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

