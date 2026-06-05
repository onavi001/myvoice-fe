import { useMemo } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { ProgressData } from "../../models/Progress";
import { RoutineData } from "../../models/Routine";
import { buildCoachClientDashboard } from "../../utils/coachProgressView";
import { MEDAL_PALETTES } from "../progress/medals/medalArt";
import MyVoiceMedal from "../progress/medals/MyVoiceMedal";
import { SmallLoader } from "../Loader";

type Props = {
  progress: ProgressData[];
  routines: RoutineData[];
  loading?: boolean;
};

function StatCell({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-[#888] leading-tight mt-0.5">{label}</p>
    </div>
  );
}

function formatLastSession(iso: string | null): string {
  if (!iso) return "Sin sesiones";
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) return "Hoy";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function ClientProgressDashboard({ progress, routines, loading }: Props) {
  const dashboard = useMemo(
    () => buildCoachClientDashboard(progress, routines),
    [progress, routines]
  );

  if (loading) {
    return (
      <section className="rounded-xl border border-[#3A3A3A] bg-[#252525] p-4 mb-4">
        <div className="flex items-center justify-center gap-2 py-6">
          <SmallLoader />
          <span className="text-sm text-[#888]">Cargando progreso…</span>
        </div>
      </section>
    );
  }

  const hasData =
    dashboard.lastSessionAt != null ||
    dashboard.weekProgressPct > 0 ||
    dashboard.unlockedMedalCount > 0;

  return (
    <section
      className="rounded-xl border border-[#3A3A3A] bg-[#252525] p-4 mb-4"
      aria-label="Progreso del cliente"
    >
      <div className="flex items-center gap-2 mb-3">
        <ChartBarIcon className="w-5 h-5 text-[#34C759]" aria-hidden />
        <h2 className="text-sm font-semibold text-[#E0E0E0]">Progreso</h2>
        <span className="ml-auto text-xs text-[#888]">
          Última sesión: {formatLastSession(dashboard.lastSessionAt)}
        </span>
      </div>

      {!hasData ? (
        <p className="text-sm text-[#888] text-center py-4">
          Aún no hay entrenamientos registrados.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-[#1A1A1A] border border-[#3A3A3A]">
            <StatCell value={dashboard.dayStreak} label="días seguidos" />
            <StatCell value={dashboard.planStreak} label="racha plan" />
            <StatCell
              value={
                dashboard.weekSessionsTotal > 0
                  ? `${dashboard.weekSessionsDone}/${dashboard.weekSessionsTotal}`
                  : dashboard.weekProgressPct
              }
              label={
                dashboard.weekSessionsTotal > 0 ? "sesiones semana" : "% rutina"
              }
            />
          </div>

          {dashboard.weekProgressPct > 0 && (
            <div className="mb-4">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-xs text-[#888]">Progreso rutina</span>
                <span className="text-lg font-bold text-[#34C759] tabular-nums">
                  {dashboard.weekProgressPct}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#4A4A4A] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#34C759] transition-all duration-300"
                  style={{ width: `${dashboard.weekProgressPct}%` }}
                />
              </div>
            </div>
          )}

          {dashboard.recentMedals.length > 0 && (
            <div>
              <p className="text-xs text-[#888] mb-2">
                Medallas ({dashboard.unlockedMedalCount} desbloqueadas)
              </p>
              <ul className="flex gap-2 overflow-x-auto pb-1">
                {dashboard.recentMedals.map((medal) => (
                  <li
                    key={medal.id}
                    className="shrink-0 flex flex-col items-center gap-1 w-16"
                    title={medal.title}
                  >
                    <MyVoiceMedal
                      achievementId={medal.id}
                      tier={medal.tier}
                      size="sm"
                      unlocked
                    />
                    <span
                      className="text-[10px] text-center leading-tight truncate w-full"
                      style={{ color: MEDAL_PALETTES[medal.tier]?.rim ?? "#888" }}
                    >
                      {medal.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
