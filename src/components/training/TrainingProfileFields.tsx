import { useEffect, useState } from "react";
import type { BiologicalSex, TrainingProfile } from "../../models/TrainingProfile";

export type TrainingProfileFormValues = Pick<
  TrainingProfile,
  "biologicalSex" | "heightCm" | "weightKg" | "sessionDurationMin"
>;

const FIELD_CLASS =
  "w-full min-h-12 px-4 py-3 bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#888] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#252525] transition-colors touch-manipulation [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const LABEL_CLASS = "block text-[#E0E0E0] text-sm font-medium mb-2";

function formatMeasureValue(value: number, allowDecimal: boolean): string {
  if (!Number.isFinite(value)) return "";
  if (allowDecimal) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  }
  return String(Math.round(value));
}

function sanitizeMeasureDraft(raw: string, allowDecimal: boolean): string {
  const normalized = raw.replace(",", ".");
  if (allowDecimal) {
    const digits = normalized.replace(/[^\d.]/g, "");
    const [whole, ...rest] = digits.split(".");
    if (rest.length === 0) return whole;
    return `${whole}.${rest.join("").slice(0, 1)}`;
  }
  return normalized.replace(/\D/g, "");
}

function MobileMeasureInput({
  id,
  name,
  label,
  value,
  min,
  max,
  allowDecimal,
  onCommit,
  error,
}: {
  id: string;
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  allowDecimal: boolean;
  onCommit: (value: number) => void;
  error?: string;
}) {
  const [draft, setDraft] = useState(() => formatMeasureValue(value, allowDecimal));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(formatMeasureValue(value, allowDecimal));
    }
  }, [value, focused, allowDecimal]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(formatMeasureValue(value, allowDecimal));
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setDraft(formatMeasureValue(value, allowDecimal));
      return;
    }

    const rounded = allowDecimal ? Math.round(parsed * 10) / 10 : Math.round(parsed);
    const clamped = Math.min(max, Math.max(min, rounded));
    onCommit(clamped);
    setDraft(formatMeasureValue(clamped, allowDecimal));
  };

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        enterKeyHint="done"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={draft}
        onFocus={(e) => {
          setFocused(true);
          setDraft(formatMeasureValue(value, allowDecimal));
          requestAnimationFrame(() => e.target.select());
        }}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onChange={(e) => setDraft(sanitizeMeasureDraft(e.target.value, allowDecimal))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className={FIELD_CLASS}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-[#FF8A80] text-xs mt-1">{error}</p>}
    </div>
  );
}

type ChipOption<T extends string> = { value: T; label: string };

function ChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = "auto",
}: {
  label: string;
  value: T;
  options: ChipOption<T>[];
  onChange: (v: T) => void;
  columns?: "auto" | 2 | 3 | 7;
}) {
  const gridClass =
    columns === 7
      ? "grid grid-cols-7 gap-2"
      : columns === 3
        ? "grid grid-cols-3 gap-2"
        : columns === 2
          ? "grid grid-cols-2 gap-2"
          : "flex flex-wrap gap-2";

  return (
    <fieldset className="space-y-2 border-0 p-0 m-0">
      <legend className={LABEL_CLASS}>{label}</legend>
      <div className={gridClass} role="group" aria-label={label}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={selected}
              className={`min-h-12 rounded-xl text-sm font-semibold border transition-colors touch-manipulation ${
                columns === 7 ? "px-0" : "px-4 py-3"
              } ${
                selected
                  ? "bg-[#34C759] text-black border-[#34C759] shadow-sm"
                  : "bg-[#2D2D2D] text-[#E0E0E0] border-[#4A4A4A] active:bg-[#383838]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180].map((m) => ({
  value: String(m),
  label: `${m} min`,
}));

type Props = {
  value: TrainingProfileFormValues;
  onChange: (field: keyof TrainingProfileFormValues, value: string | number) => void;
  errors?: Partial<Record<keyof TrainingProfileFormValues, string>>;
  compact?: boolean;
};

export default function TrainingProfileFields({ value, onChange, errors, compact }: Props) {
  return (
    <section
      className={`space-y-5 rounded-xl border border-[#34C759]/25 bg-[#34C759]/5 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <h2 className="text-sm font-semibold text-[#34C759]">Tu perfil de entrenamiento</h2>

      <ChipGroup
        label="Sexo biológico"
        value={value.biologicalSex}
        onChange={(v) => onChange("biologicalSex", v as BiologicalSex)}
        options={[
          { value: "masculino", label: "Masculino" },
          { value: "femenino", label: "Femenino" },
        ]}
        columns={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <MobileMeasureInput
          id="training-height"
          name="heightCm"
          label="Altura (cm)"
          value={value.heightCm}
          min={120}
          max={230}
          allowDecimal={false}
          onCommit={(n) => onChange("heightCm", n)}
          error={errors?.heightCm}
        />
        <MobileMeasureInput
          id="training-weight"
          name="weightKg"
          label="Peso (kg)"
          value={value.weightKg}
          min={30}
          max={250}
          allowDecimal
          onCommit={(n) => onChange("weightKg", n)}
          error={errors?.weightKg}
        />
      </div>

      <div>
        <ChipGroup
          label="Tiempo por sesión"
          value={String(value.sessionDurationMin)}
          onChange={(v) => onChange("sessionDurationMin", Number(v))}
          options={DURATION_OPTIONS}
        />
        {errors?.sessionDurationMin && (
          <p className="text-[#FF8A80] text-xs mt-1">{errors.sessionDurationMin}</p>
        )}
      </div>
    </section>
  );
}

export function formatTrainingProfileSummary(profile: TrainingProfileFormValues): string {
  const sex = profile.biologicalSex === "femenino" ? "Femenino" : "Masculino";
  return `${sex} · ${profile.heightCm} cm · ${profile.weightKg} kg · ${profile.sessionDurationMin} min/sesión`;
}
