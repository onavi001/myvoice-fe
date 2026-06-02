import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  scrollToProgressMedalsSection,
  shouldScrollToProgressMedals,
  type ProgressMedalsLocationState,
} from "../utils/scrollToProgressMedals";
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
  PlusIcon,
} from "@heroicons/react/24/outline";
import ProgressOverview from "../components/progress/ProgressOverview";
import ProgressWeekStrip from "../components/progress/ProgressWeekStrip";
import ProgressRecentSessions from "../components/progress/ProgressRecentSessions";
import ProgressFiltersPanel from "../components/progress/ProgressFiltersPanel";
import ProgressAddForm from "../components/progress/ProgressAddForm";
import ProgressPagination from "../components/progress/ProgressPagination";
import ProgressSessionGroup from "../components/progress/ProgressSessionGroup";
import { useProgressViewModel } from "../hooks/useProgressViewModel";
import WebAdBanner from "../components/ads/WebAdBanner";
import { isWebPlatform } from "../services/ads/admobConfig";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

export default function Progress() {
  const vm = useProgressViewModel();
  const location = useLocation();
  const navigate = useNavigate();
  const historialRef = useRef<HTMLDivElement>(null);
  const pageReady =
    !vm.userLoading && !vm.routineLoading && !vm.progressLoading;

  const scrollToHistorial = () => {
    historialRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!pageReady) return;
    if (!shouldScrollToProgressMedals(location.hash, location.state)) return;

    scrollToProgressMedalsSection();

    const state = location.state as ProgressMedalsLocationState | null;
    if (state?.scrollToMedals) {
      navigate(
        { pathname: location.pathname, hash: location.hash },
        { replace: true, state: {} }
      );
    }
  }, [pageReady, location.hash, location.state, location.pathname, navigate]);

  if (!pageReady) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex items-center justify-center">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col pb-24 sm:pb-6">
      <div className="p-3 sm:p-6 w-full max-w-5xl mx-auto flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h1 className="text-base sm:text-xl text-[#E0E0E0]">Progreso</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={vm.handleExport}
              className="flex items-center gap-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg px-3 py-2 text-xs sm:text-sm min-h-10 transition-colors"
              aria-label="Exportar progreso CSV"
            >
              <ArrowDownTrayIcon className="w-4 h-4" /> Exportar
            </Button>
            <Button
              onClick={() => vm.setShowFilters(!vm.showFilters)}
              className="flex items-center gap-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg px-3 py-2 text-xs sm:text-sm min-h-10 transition-colors sm:hidden"
              aria-label="Mostrar filtros"
            >
              <FunnelIcon className="w-4 h-4" /> {vm.showFilters ? "Ocultar" : "Filtros"}
            </Button>
          </div>
        </div>

        <ProgressOverview
          routines={vm.routines}
          selectedRoutineId={vm.selectedRoutineId}
          onRoutineChange={vm.handleRoutineChange}
          overview={vm.trainingOverview}
          period={vm.periodPreset}
          onPeriodChange={vm.handlePeriodChange}
          entriesInPeriod={vm.entriesInPeriod}
          uniqueExercisesInPeriod={vm.uniqueExercisesInPeriod}
          personalRecords={vm.personalRecords}
          lastWorkoutLabel={vm.lastWorkoutLabel}
          topExerciseName={vm.topExerciseName}
          consistencyInsights={vm.consistencyInsights}
          progressAchievements={vm.progressAchievements}
        />

        {vm.activityStrip.some((d) => d.trained) && (
          <div className="mb-4">
            <ProgressWeekStrip
              days={vm.activityStrip}
              trainedCount={vm.activityStripTrainedCount}
            />
          </div>
        )}

        {vm.recentSessions.length > 0 && (
          <div className="mb-4">
            <ProgressRecentSessions
              sessions={vm.recentSessions}
              onViewAll={scrollToHistorial}
            />
          </div>
        )}

        <div ref={historialRef} id="historial" className="space-y-2 scroll-mt-4">
          <h2 className="text-sm font-semibold text-[#888]">Historial</h2>
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
          <div className="mt-4 bg-[#252525] border border-[#3A3A3A] rounded-lg p-2 sm:p-3 h-56 sm:h-80">
            <Line data={vm.chartData} options={vm.chartOptions} />
          </div>
        )}

        {vm.sessionGroups.length === 0 ? (
          <div className="mt-4 text-center space-y-2 px-2">
            <p className="text-[#E0E0E0] text-sm">
              {vm.searchQuery || vm.muscleFilter || vm.periodPreset !== "all"
                ? "No hay registros con este filtro."
                : "Aún no tienes progreso registrado."}
            </p>
            {!vm.searchQuery && !vm.muscleFilter && vm.periodPreset === "all" && (
              <p className="text-[#B0B0B0] text-xs">
                Marca ejercicios en tu rutina o usa el botón + para agregar un registro.
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-[#666] mt-3 mb-2">
              {vm.sessionGroups.length} {vm.sessionGroups.length === 1 ? "día" : "días"} · toca un día
              para ver ejercicios
            </p>
            <div className="mt-2 space-y-2">
              {vm.paginatedSessionGroups.map((group) => (
                <ProgressSessionGroup
                  key={group.dateKey}
                  group={group}
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
        {isWebPlatform() && <WebAdBanner />}
      </div>

      <button
        type="button"
        onClick={() => {
          vm.setShowAddForm(true);
          scrollToHistorial();
        }}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#34C759] text-black font-semibold shadow-lg px-5 min-h-12 touch-manipulation sm:bottom-8 sm:right-8"
        aria-label="Agregar progreso"
      >
        <PlusIcon className="w-5 h-5" />
        <span className="text-sm">Agregar</span>
      </button>
    </div>
  );
}
