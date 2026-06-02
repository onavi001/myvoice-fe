import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { DaySessionGroup } from "../../utils/progressInsights";

type Props = {
  sessions: DaySessionGroup[];
  onViewAll?: () => void;
};

function formatExerciseSummary(name: string, reps: number, repsUnit: string, weight: number, weightUnit: string) {
  const repsLabel = repsUnit === "seconds" ? `${reps}s` : `${reps} reps`;
  if (weight > 0) return `${name} · ${repsLabel} · ${weight}${weightUnit}`;
  return `${name} · ${repsLabel}`;
}

export default function ProgressRecentSessions({ sessions, onViewAll }: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (sessions.length === 0) return null;

  return (
    <section className="space-y-2" aria-label="Sesiones recientes">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#E0E0E0]">Sesiones recientes</h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-[#34C759] font-medium min-h-10 px-2 touch-manipulation"
          >
            Ver historial
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {sessions.map((session) => {
          const open = expandedKey === session.dateKey;
          const preview = session.entries.slice(0, 3);
          return (
            <li
              key={session.dateKey}
              className="rounded-xl border border-[#3C3C3C] bg-[#252525] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedKey(open ? null : session.dateKey)}
                className="w-full flex items-center justify-between gap-3 p-3 text-left touch-manipulation min-h-[52px]"
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#E0E0E0]">{session.label}</p>
                  <p className="text-xs text-[#888] truncate">
                    {session.dayName ? `${session.dayName} · ` : ""}
                    {session.exerciseCount}{" "}
                    {session.exerciseCount === 1 ? "ejercicio" : "ejercicios"}
                  </p>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 shrink-0 text-[#888] transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <ul className="px-3 pb-3 space-y-2 border-t border-[#3C3C3C] pt-2">
                  {session.entries.map((entry) => (
                    <li key={entry._id} className="text-xs text-[#B0B0B0] min-w-0">
                      <span className="text-[#E0E0E0] block truncate">
                        {formatExerciseSummary(
                          entry.exerciseName,
                          entry.reps,
                          entry.repsUnit,
                          entry.weight,
                          entry.weightUnit
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {!open && preview.length > 0 && (
                <p className="px-3 pb-3 text-[10px] text-[#666] truncate -mt-1">
                  {preview.map((e) => e.exerciseName).join(" · ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
