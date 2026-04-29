import Button from "../components/Button";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "react-datepicker/dist/react-datepicker.css";
import {
  ArrowDownTrayIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import ProgressFiltersPanel from "../components/progress/ProgressFiltersPanel";
import ProgressAddForm from "../components/progress/ProgressAddForm";
import ProgressPagination from "../components/progress/ProgressPagination";
import ProgressCard from "../components/progress/ProgressCard";
import { useProgressViewModel } from "../hooks/useProgressViewModel";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

export default function Progress() {
  const vm = useProgressViewModel();

  if (vm.userLoading || vm.routineLoading || vm.progressLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex items-center justify-center">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-3 sm:p-6 w-full max-w-5xl mx-auto flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl text-[#E0E0E0]">Progreso</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button
              onClick={vm.handleExport}
              className="flex items-center gap-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors"
              aria-label="Export progress as CSV"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Exportar
            </Button>
            <Button
              onClick={() => vm.setShowFilters(!vm.showFilters)}
              className="flex items-center gap-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors sm:hidden"
              aria-label="Toggle filters"
            >
              <FunnelIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {vm.showFilters ? "Ocultar Filtros" : "Filtros"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <ProgressFiltersPanel
            showFilters={vm.showFilters}
            searchQuery={vm.searchQuery}
            onSearchChange={vm.setSearchQuery}
            dateFilter={vm.dateFilter}
            onDateFilterChange={vm.setDateFilter}
            muscleFilter={vm.muscleFilter}
            muscles={vm.muscles}
            onMuscleFilterChange={vm.setMuscleFilter}
            showChart={vm.showChart}
            onToggleChart={() => vm.setShowChart(!vm.showChart)}
            chartMetric={vm.chartMetric}
            onChartMetricChange={vm.setChartMetric}
            chartExercise={vm.chartExercise}
            onChartExerciseChange={vm.setChartExercise}
            exercises={vm.exercises}
            sortBy={vm.sortBy}
            onSortByChange={vm.setSortBy}
            sortOrder={vm.sortOrder}
            onSortOrderChange={vm.setSortOrder}
          />
        </div>

        <ProgressAddForm
          showAddForm={vm.showAddForm}
          onToggleShowAddForm={() => vm.setShowAddForm(!vm.showAddForm)}
          onCloseForm={() => vm.setShowAddForm(false)}
          onSubmit={vm.handleAddSubmit}
          newProgress={vm.newProgress}
          formErrors={vm.formErrors}
          exercises={vm.exercises}
          addingProgress={vm.addingProgress}
          onChange={vm.handleAddChange}
        />

        {vm.showChart && vm.filteredProgress.length > 0 && (
          <div className="mt-4 bg-[#252525] border border-[#3A3A3A] rounded-lg p-2 sm:p-3 h-64 sm:h-80">
            <Line data={vm.chartData} options={vm.chartOptions} />
          </div>
        )}

        {vm.filteredProgress.length === 0 ? (
          <p className="text-[#B0B0B0] text-xs sm:text-sm mt-4 text-center">No hay progreso registrado con este filtro.</p>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              {vm.paginatedProgress.map((entry, index) => (
                <ProgressCard
                  key={entry._id}
                  entry={entry}
                  index={index}
                  expandedCardKey={vm.expandedCardKey}
                  editData={vm.editData}
                  savingProgress={vm.savingProgress}
                  deletingProgress={vm.deletingProgress}
                  toggleExpandCard={vm.toggleExpandCard}
                  handleEditChange={vm.handleEditChange}
                  handleSaveEdit={vm.handleSaveEdit}
                  handleDelete={vm.handleDelete}
                />
              ))}
            </div>

            <ProgressPagination
              totalPages={vm.totalPages}
              currentPage={vm.currentPage}
              itemsPerPage={vm.itemsPerPage}
              onItemsPerPageChange={(value) => {
                vm.setItemsPerPage(value);
                vm.setCurrentPage(1);
              }}
              onCurrentPageChange={vm.setCurrentPage}
            />
          </>
        )}
        {vm.toast && <Toast type={vm.toast.variant} message={vm.toast.message} onClose={vm.handleCloseToast} />}
      </div>
    </div>
  );
}