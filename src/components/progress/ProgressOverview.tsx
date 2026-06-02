import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import HappyCoach from "../mascot/HappyCoach";
import ProgressAchievements from "./ProgressAchievements";
import ProgressConsistencyInsights from "./ProgressConsistencyInsights";
import type { ProgressAchievement } from "../../utils/progressAchievements";
import type { ConsistencyInsight } from "../../utils/consistencyInsights";
import type { PeriodPreset, PersonalRecord, TrainingOverview } from "../../utils/progressOverview";
import { RoutineData } from "../../models/Routine";

type Props = {
  routines: RoutineData[];
  selectedRoutineId: string | null;
  onRoutineChange: (routineId: string) => void;
  overview: TrainingOverview | null;
  period: PeriodPreset;
  onPeriodChange: (preset: PeriodPreset) => void;
  entriesInPeriod: number;
  uniqueExercisesInPeriod: number;
  personalRecords: PersonalRecord[];
  lastWorkoutLabel: string;
  topExerciseName: string | null;
  consistencyInsights: ConsistencyInsight[];
  progressAchievements: ProgressAchievement[];
};

const PERIOD_OPTIONS: { id: PeriodPreset; label: string }[] = [
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
  { id: "90d", label: "90 días" },
  { id: "all", label: "Todo" },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#3C3C3C] bg-[#1A1A1A] p-3 min-w-0">
      <p className="text-xs text-[#888] truncate">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums mt-1">{value}</p>
      {sub && <p className="text-xs text-[#666] mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

export default function ProgressOverview({
  routines,
  selectedRoutineId,
  onRoutineChange,
  overview,
  period,
  onPeriodChange,
  entriesInPeriod,
  uniqueExercisesInPeriod,
  personalRecords,
  lastWorkoutLabel,
  topExerciseName,
  consistencyInsights,
  progressAchievements,
}: Props) {
  const [showMoreStats, setShowMoreStats] = useState(false);

  return (
    <section className="mb-4 space-y-3" aria-label="Resumen de entrenamiento">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#34C759]">Tu entrenamiento</h2>
        {(routines.length > 1 || overview) && (
          <label className="text-xs text-[#888] flex items-center gap-2 min-w-0">
            <span className="shrink-0">Rutina</span>
            <select
              value={selectedRoutineId ?? ""}
              onChange={(e) => onRoutineChange(e.target.value)}
              disabled={routines.length <= 1}
              className="flex-1 min-h-10 px-2 rounded-lg bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] text-sm disabled:opacity-80"
            >
              {routines.map((r) => (
                <option key={r._id.toString()} value={r._id.toString()}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onPeriodChange(opt.id)}
            className={`min-h-10 px-4 rounded-full text-sm font-medium touch-manipulation transition-colors ${
              period === opt.id
                ? "bg-[#34C759] text-black"
                : "bg-[#2D2D2D] text-[#E0E0E0] border border-[#4A4A4A]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {overview ? (
        <>
          <div className="p-3 rounded-xl bg-[#252525] border border-[#3C3C3C]">
            <HappyCoach
              variant={
                overview.dayStreak > 0 || overview.weekStreak > 0 || overview.planStreak > 0
                  ? "celebrate"
                  : "idle"
              }
              size="md"
              animated={false}
              message={
                overview.dayStreak > 0 || overview.weekStreak > 0
                  ? `${overview.dayStreak} ${overview.dayStreak === 1 ? "día" : "días"} y ${overview.weekStreak} ${overview.weekStreak === 1 ? "semana" : "semanas"} seguidas entrenando.`
                  : overview.planStreak > 0
                    ? `Racha del plan: ${overview.planStreak} ${overview.planStreak === 1 ? "sesión" : "sesiones"}.`
                    : undefined
              }
              messageKey={overview.dayStreak === 0 && overview.weekStreak === 0 ? "streak" : undefined}
              messageParams={{ streak: overview.planStreak }}
            />
            <p className="text-xs text-[#888] mt-2">{lastWorkoutLabel}</p>
            {topExerciseName && (
              <p className="text-xs text-[#666] mt-0.5 truncate">
                Más registrado: <span className="text-[#34C759]">{topExerciseName}</span>
              </p>
            )}
            <p className="text-xs text-[#666] mt-1">
              Próximo: {overview.nextDayLabel} · Semana {overview.weekSessionsDone}/
              {overview.weekSessionsTotal}
            </p>
          </div>

          <ProgressConsistencyInsights insights={consistencyInsights} />

          <ProgressAchievements achievements={progressAchievements} />

          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Días" value={String(overview.dayStreak)} sub="seguidos" />
            <StatCard label="Semanas" value={String(overview.weekStreak)} sub="seguidas" />
            <StatCard
              label="Plan"
              value={`${overview.weekSessionsDone}/${overview.weekSessionsTotal}`}
              sub="esta semana"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowMoreStats((v) => !v)}
            className="w-full flex items-center justify-center gap-1 min-h-10 text-xs text-[#888] touch-manipulation"
            aria-expanded={showMoreStats}
          >
            {showMoreStats ? "Menos detalle" : "Más estadísticas"}
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${showMoreStats ? "rotate-180" : ""}`}
            />
          </button>

          {showMoreStats && (
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="Racha del plan"
                value={String(overview.planStreak)}
                sub="sesiones en orden"
              />
              <StatCard
                label="Rutina"
                value={`${overview.routineCompletionPct}%`}
                sub="ejercicios marcados"
              />
              <StatCard
                label="Total días"
                value={String(overview.totalTrainingDays)}
                sub="con sesión"
              />
              <StatCard
                label="Total semanas"
                value={String(overview.totalTrainingWeeks)}
                sub="con sesión"
              />
              <StatCard label="Registros" value={String(entriesInPeriod)} sub="en el periodo" />
              <StatCard
                label="Ejercicios"
                value={String(uniqueExercisesInPeriod)}
                sub="distintos"
              />
            </div>
          )}

          {personalRecords.length > 0 && (
            <div className="rounded-xl border border-[#3C3C3C] bg-[#252525] p-3">
              <h3 className="text-sm font-semibold text-[#E0E0E0] mb-2">Mejores marcas (peso)</h3>
              <ul className="space-y-2">
                {personalRecords.map((pr) => (
                  <li
                    key={pr.exerciseName}
                    className="flex items-center justify-between gap-2 text-sm min-w-0"
                  >
                    <span className="text-[#E0E0E0] truncate">{pr.exerciseName}</span>
                    <span className="text-[#34C759] font-semibold tabular-nums shrink-0">
                      {pr.weight} {pr.weightUnit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-[#3C3C3C] bg-[#252525] p-4">
          <HappyCoach variant="idle" size="md" animated={false} messageKey="emptyRoutine" />
          <p className="text-xs text-[#888] mt-2 text-center">
            Crea una rutina para ver racha y avance aquí.
          </p>
        </div>
      )}
    </section>
  );
}
