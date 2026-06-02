import type { ActivityStripDay } from "../../utils/progressInsights";

type Props = {
  days: ActivityStripDay[];
  trainedCount: number;
};

export default function ProgressWeekStrip({ days, trainedCount }: Props) {
  return (
    <section
      className="rounded-xl border border-[#3C3C3C] bg-[#252525] p-3"
      aria-label="Actividad de los últimos 14 días"
    >
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-[#E0E0E0]">Últimos 14 días</h3>
        <span className="text-xs text-[#34C759] tabular-nums">
          {trainedCount}/{days.length} activos
        </span>
      </div>
      <div className="flex justify-between gap-1">
        {days.map((day) => (
          <div key={day.dateKey} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[10px] text-[#666]">{day.shortLabel}</span>
            <div
              className={`w-full max-w-[22px] aspect-square rounded-full border-2 transition-colors ${
                day.trained
                  ? "bg-[#34C759] border-[#34C759]"
                  : "bg-transparent border-[#4A4A4A]"
              } ${day.isToday ? "ring-2 ring-[#34C759]/40 ring-offset-1 ring-offset-[#252525]" : ""}`}
              title={day.dateKey}
              aria-label={`${day.shortLabel} ${day.trained ? "con entreno" : "sin entreno"}`}
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#666] mt-2 text-center">
        Verde = día con ejercicios registrados
      </p>
    </section>
  );
}
