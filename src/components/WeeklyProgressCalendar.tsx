import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { AppDispatch, RootState } from '../store';
import { fetchProgress } from '../store/progressSlice';
import { ProgressData } from '../models/Progress';
import { RoutineData } from '../models/Routine';

const WeeklyProgressCalendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { progress } = useSelector((state: RootState) => state.progress);
  const { routines, selectedRoutineId } = useSelector((state: RootState) => state.routine);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    dispatch(fetchProgress());
  }, [dispatch]);

  const weekData = useMemo(() => {
    // Obtener la semana actual (lunes a domingo)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // Lunes
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
    endOfWeek.setHours(23, 59, 59, 999);

    // Encontrar la rutina seleccionada
    const selectedRoutine = routines.find((r: RoutineData) => r._id === selectedRoutineId);

    // Filtrar progreso para la semana y rutina seleccionada
    const weekProgress = progress.filter((ex: ProgressData) => {
      const exDate = new Date(ex.date);
      return exDate >= startOfWeek && exDate <= endOfWeek && ex.routineId === selectedRoutineId;
    });

    // Generar datos para cada día
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];
      const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][i];

      // Obtener ejercicios planificados para el día
      const dayRoutine = selectedRoutine?.days.find((d) => d.dayName === dayName);
      const plannedExercises = dayRoutine ? dayRoutine.exercises.length : 0;

      // Obtener progreso del día
      const dayProgress = weekProgress.filter(
        (ex) => new Date(ex.date).toISOString().split('T')[0] === dayStr
      );
      const completedExercises = dayProgress.filter((ex) => ex.completed).length;

      // Calcular porcentaje
      const percentage = plannedExercises > 0 ? (completedExercises / plannedExercises) * 100 : 0;

      return {
        date: day,
        label: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
        percentage: Math.round(percentage),
        exercises: dayProgress,
      };
    });

    return days;
  }, [progress, routines, selectedRoutineId]);

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const closeModal = () => {
    setSelectedDay(null);
  };

  const selectedDayProgress = selectedDay
    ? weekData.find(
        (d) => d.date.toISOString().split('T')[0] === selectedDay.toISOString().split('T')[0]
      )?.exercises || []
    : [];

  return (
    <div
      className="bg-[#2D2D2D] p-3 rounded-lg shadow-sm mb-4 w-full max-w-full"
      aria-label="Calendario de progreso semanal"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 bg-[#4A4A4A] text-[#E0E0E0] text-xs font-semibold rounded hover:bg-[#5A5A5A] transition-colors"
      >
        <span>{isOpen ? 'Ocultar Progreso Semanal' : 'Mostrar Progreso Semanal'}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'h-auto' : 'h-0'
        }`}
      >
        <div className="flex overflow-x-auto space-x-2 mt-2 scrollbar-hidden">
          {weekData.map((day) => (
            <button
              key={day.date.toISOString()}
              onClick={() => handleDayClick(day.date)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full text-xs font-medium ${
                day.percentage > 0
                  ? 'bg-[#34C759] text-[#1A1A1A]'
                  : 'bg-[#4A4A4A] text-[#B0B0B0]'
              }`}
            >
              <span>{day.label}</span>
              <span>{day.percentage}%</span>
            </button>
          ))}
        </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2D2D2D] p-4 rounded-lg max-w-[90%] max-h-[80%] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-[#E0E0E0]">
                Detalles del {selectedDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
              </h3>
              <button onClick={closeModal}>
                <XMarkIcon className="w-5 h-5 text-[#B0B0B0]" />
              </button>
            </div>
            {selectedDayProgress.length > 0 ? (
              <ul className="text-xs text-[#E0E0E0] space-y-2">
                {selectedDayProgress.map((ex: ProgressData) => (
                  <li key={ex._id} className="bg-[#4A4A4A] p-2 rounded">
                    <p><strong>Ejercicio:</strong> {ex.exerciseName}</p>
                    <p><strong>Series:</strong> {ex.sets}</p>
                    <p><strong>Repeticiones:</strong> {ex.reps}</p>
                    {ex.weight > 0 && (
                      <p><strong>Peso:</strong> {ex.weight} {ex.weightUnit || 'kg'}</p>
                    )}
                    <p><strong>Completado:</strong> {ex.completed ? 'Sí' : 'No'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#B0B0B0]">No hay ejercicios registrados este día.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyProgressCalendar;