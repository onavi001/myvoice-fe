import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Loader, { SmallLoader } from "../components/Loader";
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, ExclamationCircleIcon } from "@heroicons/react/20/solid";
import RoutineDayCard from "../components/routine/RoutineDayCard";
import { useRoutineEditController } from "../hooks/useRoutineEditController";


const RoutineEdit: React.FC = () => {
  const {
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
  } = useRoutineEditController();

  // Brighter circuit colors for better contrast
  const circuitColors = ["#4CAF50", "#AB47BC", "#42A5F5", "#FFCA28", "#EF5350"];

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
      <div className="p-3 sm:p-6 w-full max-w-4xl mx-auto flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-[#FFD700]">
            Editar Rutina: {routineName || "Sin nombre"}
          </h1>
          <Button
            variant="secondary"
            onClick={toggleAll}
            disabled={isCoachRestricted}
            className="w-full sm:w-auto !bg-[#2563EB] !text-white hover:!bg-[#1D4ED8] rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold !border-[#1D4ED8] shadow-md disabled:!bg-[#1D4ED8]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-10 sm:min-h-11"
          >
            {allExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            {allExpanded ? "Colapsar Todo" : "Expandir Todo"}
          </Button>
        </div>

        {isCoachRestricted && (
          <Card className="p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-6">
            <p className="text-[#EF5350] text-sm flex items-center gap-1">
              <ExclamationCircleIcon className="w-5 h-5" />
              Esta rutina solo puede ser editada por el coach asignado.
            </p>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md">
            <label className="block text-[#E0E0E0] text-sm font-medium mb-2">Nombre de la Rutina</label>
            <Input
              name="routineName"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="Ejemplo: Rutina de Fuerza"
              disabled={isCoachRestricted}
              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:bg-[#2D2D2D]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-12"
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
              return (
                <RoutineDayCard
                  key={day._id}
                  day={day}
                  dayIndex={dayIndex}
                  routineId={routineId!}
                  isCoachRestricted={isCoachRestricted}
                  errors={errors.days}
                  circuitColors={circuitColors}
                  toggleDay={toggleDay}
                  handleDayChange={handleDayChange}
                  handleExerciseChange={handleExerciseChange}
                  handleDeleteExercise={handleDeleteExercise}
                  toggleExercise={toggleExercise}
                  handleDeleteDay={handleDeleteDay}
                  handleAddExercise={handleAddExercise}
                  groupExercisesByCircuit={groupExercisesByCircuit}
                  getCircuitIdsForDay={getCircuitIdsForDay}
                  totalDays={days.length}
                />
              );
            })}
          </AnimatePresence>

          <Button
            variant="secondary"
            type="button"
            onClick={handleAddDay}
            disabled={addingDay || isCoachRestricted}
            className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold border border-[#1E88E5] shadow-md disabled:bg-[#1E88E5]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-10 sm:min-h-11"
          >
            {addingDay ? <SmallLoader /> : (
              <>
                <PlusIcon className="w-5 h-5" /> Agregar Día
              </>
            )}
          </Button>

          <div className="sticky bottom-0 z-20 mt-6 -mx-3 border-t border-[#3A3A3A] bg-[#1A1A1A]/95 px-3 py-2 backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0">
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <Button
                type="submit"
                disabled={savingRoutine || deletingRoutine || isCoachRestricted}
                className="col-span-1 sm:col-span-2 w-full bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-10 sm:min-h-11"
              >
                {savingRoutine ? <SmallLoader /> : "Guardar Rutina"}
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={savingRoutine || deletingRoutine || isCoachRestricted}
                className="col-span-1 w-full bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors min-h-10 sm:min-h-11"
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

export default RoutineEdit;