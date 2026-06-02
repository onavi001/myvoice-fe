import type { ConsistencyInsight, ConsistencyInsightTone } from "../../utils/consistencyInsights";

type Props = {
  insights: ConsistencyInsight[];
};

const toneStyles: Record<ConsistencyInsightTone, string> = {
  positive: "border-[#34C759]/50 bg-[#34C759]/10 text-[#E8FFE8]",
  neutral: "border-[#4A4A4A] bg-[#1A1A1A] text-[#E0E0E0]",
  nudge: "border-[#FFB74D]/40 bg-[#FFB74D]/10 text-[#FFE8CC]",
};

export default function ProgressConsistencyInsights({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-2" aria-label="Insights de constancia">
      <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wide">
        Constancia
      </h3>
      <ul className="space-y-2">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className={`rounded-xl border px-3 py-2.5 text-sm leading-snug ${toneStyles[insight.tone]}`}
          >
            {insight.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
