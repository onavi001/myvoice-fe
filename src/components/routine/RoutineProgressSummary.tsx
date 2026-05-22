import { useState } from "react";
import { useDispatch } from "react-redux";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AppDispatch } from "../../store";
import { resetDayProgress, resetRoutineProgress } from "../../store/routineSlice";
import { RoutineData } from "../../models/Routine";
import { calculateDayProgress, calculateWeekProgress } from "../../utils/calculateProgress";
import Button from "../Button";

type Props = {
  routine: RoutineData;
  day: RoutineData["days"][number];
  dayId: string;
};

function ProgressMiniBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs text-[#888]">{label}</span>
        <span className="text-2xl font-bold text-white tabular-nums">{pct}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-[#4A4A4A] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#34C759] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function RoutineProgressSummary({ routine, day, dayId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [expanded, setExpanded] = useState(false);

  const dayPct = calculateDayProgress(day);
  const weekPct = calculateWeekProgress(routine);
  const hasProgress = dayPct > 0 || weekPct > 0;

  const handleResetDay = () => {
    void dispatch(resetDayProgress({ routineId: routine._id.toString(), dayId }));
  };

  const handleResetWeek = () => {
    void dispatch(resetRoutineProgress({ routineId: routine._id.toString() }));
  };

  return (
    <section
      className="mb-4 rounded-xl border border-[#3C3C3C] bg-[#252525] overflow-hidden"
      aria-label="Resumen de progreso"
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left touch-manipulation"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <span className="text-sm font-semibold text-[#34C759]">Tu progreso</span>
          {!expanded && (
            <p className="text-xs text-[#888] mt-0.5 tabular-nums">
              Hoy {Math.round(dayPct)}% · Semana {Math.round(weekPct)}%
            </p>
          )}
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 shrink-0 text-[#888] transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#3C3C3C]">
          <div className="grid grid-cols-2 gap-4 pt-3 mb-4">
            <ProgressMiniBar value={dayPct} label="Hoy" />
            <ProgressMiniBar value={weekPct} label="Semana" />
          </div>

          {hasProgress ? (
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#3C3C3C]">
              {dayPct > 0 && (
                <Button
                  variant="outline"
                  onClick={handleResetDay}
                  className="w-full min-h-11 text-xs rounded-xl"
                >
                  Reiniciar día actual
                </Button>
              )}
              {weekPct > 0 && (
                <Button
                  variant="outlineDanger"
                  onClick={handleResetWeek}
                  className="w-full min-h-11 text-xs rounded-xl"
                >
                  Reiniciar rutina completa
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#888] pt-3 border-t border-[#3C3C3C]">
              Marca ejercicios como completados para registrar tu progreso.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
