import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import HappyCoach from "../mascot/HappyCoach";
import { AppDispatch } from "../../store";
import { resetDayProgress, resetRoutineProgress } from "../../store/routineSlice";
import { RoutineData } from "../../models/Routine";
import { calculateDayProgress, calculateWeekProgress } from "../../utils/calculateProgress";
import {
  countWeeklyPlanSessions,
  getNextPlannedDayLabel,
  loadPlanStreakState,
  resetPlanStreak,
} from "../../utils/planStreak";
import { usageSummary } from "../../utils/freemium";
import { useWorkoutReminders } from "../../hooks/useWorkoutReminders";
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
  const { enabled, hour, minute, native, status, toggleEnabled, updateTime } = useWorkoutReminders();

  const routineId = routine._id.toString();
  const progressKey = routine.days.map((d) => `${d._id}:${Math.round(calculateDayProgress(d))}`).join("|");
  const streakState = useMemo(() => loadPlanStreakState(routineId), [routineId, progressKey]);
  const weekSessions = useMemo(() => countWeeklyPlanSessions(routine), [routine, progressKey]);
  const dayPct = calculateDayProgress(day);
  const weekPct = calculateWeekProgress(routine);
  const hasProgress = dayPct > 0 || weekPct > 0;

  const handleResetDay = () => {
    void dispatch(resetDayProgress({ routineId, dayId }));
  };

  const handleResetWeek = () => {
    void dispatch(resetRoutineProgress({ routineId }));
    resetPlanStreak(routineId);
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
              Racha {streakState.streak} · Hoy {Math.round(dayPct)}% · Semana {Math.round(weekPct)}%
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
          <div className="pt-3 mb-4 p-3 rounded-xl bg-[#1A1A1A] border border-[#3C3C3C]">
            <HappyCoach
              variant={streakState.streak > 0 ? "celebrate" : "idle"}
              size="md"
              animated
              messageKey="streak"
              messageParams={{ streak: streakState.streak }}
            />
            <p className="text-2xl font-bold text-white tabular-nums mt-3">{streakState.streak}</p>
            <p className="text-xs text-[#888]">
              sesiones seguidas según tu plan · próxima: {getNextPlannedDayLabel(routine)}
            </p>
            <p className="text-xs text-[#666] mt-1">
              Esta semana: {weekSessions.done}/{weekSessions.total} sesiones del plan · 1 día de gracia/semana
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <ProgressMiniBar value={dayPct} label="Día actual" />
            <ProgressMiniBar value={weekPct} label="Rutina total" />
          </div>

          <div className="mb-4 p-3 rounded-xl bg-[#1A1A1A] border border-[#3C3C3C]">
            <label className="flex items-center gap-3 touch-manipulation cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => void toggleEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#34C759]"
              />
              <span className="text-sm text-[#E0E0E0]">Recordatorios Lun / Mié / Vie</span>
            </label>
            {enabled && (
              <div className="flex items-center gap-2 mt-3">
                <label className="text-xs text-[#888]">Hora</label>
                <input
                  type="time"
                  value={`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":").map(Number);
                    void updateTime(h, m);
                  }}
                  className="flex-1 min-h-10 px-2 rounded-lg bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0]"
                />
              </div>
            )}
            {status && <p className="text-xs text-[#888] mt-2">{status}</p>}
            {!native && enabled && (
              <p className="text-xs text-[#666] mt-1">En navegador web los recordatorios no están disponibles.</p>
            )}
          </div>

          <p className="text-xs text-[#666] mb-3">{usageSummary()}</p>

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
            <div className="pt-3 border-t border-[#3C3C3C]">
              <HappyCoach variant="encourage" size="md" animated messageKey="progressHint" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
