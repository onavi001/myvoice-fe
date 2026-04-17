import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';
import { AppDispatch, RootState } from '../store';
import { fetchProgress } from '../store/progressSlice';
import { ProgressData } from '../models/Progress';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const WeeklyExerciseChart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { progress } = useSelector((state: RootState) => state.progress);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProgress());
  }, [dispatch]);

  const chartData = useMemo(() => {
    // Obtener la semana actual (lunes a domingo) según la fecha del usuario
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // Lunes
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
    endOfWeek.setHours(23, 59, 59, 999);

    // Filtrar progreso para la semana actual
    const weekProgress = progress.filter((ex: ProgressData) => {
      const exDate = new Date(ex.date);
      return exDate >= startOfWeek && exDate <= endOfWeek;
    });

    // Contar días únicos con ejercicio
    const daysExercised: { [key: string]: boolean } = {};
    weekProgress.forEach((ex) => {
      const dateStr = new Date(ex.date).toISOString().split('T')[0];
      daysExercised[dateStr] = true;
    });

    // Preparar datos para cada día (lunes a domingo)
    const labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const data = labels.map((_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);
      const dayStr = day.toISOString().split('T')[0];
      return daysExercised[dayStr] ? 1 : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Días con Ejercicio',
          data,
          backgroundColor: '#34C759', // Verde acorde con RoutinePage
          borderColor: '#34C759',
          borderWidth: 1,
        },
      ],
    };
  }, [progress]);

  return (
    <div
      className="bg-[#2D2D2D] p-3 rounded-lg shadow-sm mb-4 w-full max-w-full"
      aria-label="Gráfico de días con ejercicio de la semana actual"
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
        <div className="overflow-x-auto">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Esta Semana',
                  color: '#E0E0E0',
                  font: { size: 12, weight: 'bold' },
                  padding: { top: 8, bottom: 4 },
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: '#4A4A4A',
                  titleColor: '#E0E0E0',
                  bodyColor: '#B0B0B0',
                  titleFont: { size: 10 },
                  bodyFont: { size: 10 },
                  padding: 6,
                },
                legend: { display: false },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#B0B0B0',
                    font: { size: 10 },
                    padding: 2,
                  },
                  grid: { display: false },
                },
                y: {
                  ticks: {
                    color: '#B0B0B0',
                    font: { size: 10 },
                    stepSize: 1,
                    callback: (value) => (value === 1 ? 'Sí' : 'No'),
                    padding: 2,
                  },
                  grid: { display: false },
                  max: 1,
                  beginAtZero: true,
                },
              },
              layout: {
                padding: { left: 4, right: 4, top: 4, bottom: 4 },
              },
            }}
            className="h-48 w-full min-w-[280px]"
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklyExerciseChart;