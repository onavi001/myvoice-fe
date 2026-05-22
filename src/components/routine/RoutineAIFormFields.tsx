import type { ReactNode } from "react";
import Input from "../Input";

export type RoutineAIFormData = {
  level: "principiante" | "intermedio" | "avanzado";
  goal: "fuerza" | "hipertrofia" | "resistencia";
  days: number;
  equipment: "gym" | "casa" | "pesas";
  name: string;
  notes: string;
  blockWeeks: number;
  sessionDurationMin: number;
  injuriesOrPain: string;
  goalMetric: string;
  targetDate: string;
  sleepHours: number;
  stressLevel: "bajo" | "medio" | "alto";
  trainingAgeMonths: number;
};

const FIELD_CLASS =
  "w-full min-h-12 px-4 py-3 bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#888] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#252525] transition-colors touch-manipulation";

const TEXTAREA_CLASS = `${FIELD_CLASS} min-h-[5.5rem] resize-y leading-relaxed`;

const LABEL_CLASS = "block text-[#E0E0E0] text-sm font-medium mb-2";

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
  columns?: "auto" | 3 | 7;
}) {
  const gridClass =
    columns === 7
      ? "grid grid-cols-7 gap-2"
      : columns === 3
        ? "grid grid-cols-3 gap-2"
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

function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-[#888] -mt-1">{hint}</p> : null}
    </div>
  );
}

function NumberField({
  label,
  name,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <FormField label={label} htmlFor={name} hint={hint}>
      <Input
        name={name}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isFinite(n)) return;
          onChange(Math.min(max, Math.max(min, n)));
        }}
        className={FIELD_CLASS}
      />
    </FormField>
  );
}

type Props = {
  formData: RoutineAIFormData;
  onChange: (field: keyof RoutineAIFormData, value: string | number) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
};

export default function RoutineAIFormFields({
  formData,
  onChange,
  showAdvanced,
  onToggleAdvanced,
}: Props) {
  const dayOptions = [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    value: String(d),
    label: String(d),
  }));

  return (
    <div className="space-y-6">
      <section className="space-y-5" aria-labelledby="routine-ai-base">
        <h2 id="routine-ai-base" className="text-base font-semibold text-[#34C759]">
          Configuración base
        </h2>

        <FormField label="Nombre de la rutina" htmlFor="routine-ai-name">
          <Input
            name="name"
            id="routine-ai-name"
            type="text"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Ej: Rutina de volumen"
            className={FIELD_CLASS}
            autoComplete="off"
          />
        </FormField>

        <ChipGroup
          label="Objetivo"
          value={formData.goal}
          onChange={(v) => onChange("goal", v)}
          options={[
            { value: "fuerza", label: "Fuerza" },
            { value: "hipertrofia", label: "Hipertrofia" },
            { value: "resistencia", label: "Resistencia" },
          ]}
        />

        <ChipGroup
          label="Nivel"
          value={formData.level}
          onChange={(v) => onChange("level", v)}
          options={[
            { value: "principiante", label: "Principiante" },
            { value: "intermedio", label: "Intermedio" },
            { value: "avanzado", label: "Avanzado" },
          ]}
        />

        <ChipGroup
          label="Equipo disponible"
          value={formData.equipment}
          onChange={(v) => onChange("equipment", v)}
          options={[
            { value: "gym", label: "Gimnasio" },
            { value: "casa", label: "Casa" },
            { value: "pesas", label: "Pesas" },
          ]}
        />

        <ChipGroup
          label="Días por semana"
          value={String(formData.days)}
          onChange={(v) => onChange("days", Number(v))}
          options={dayOptions}
          columns={7}
        />

        <FormField
          label="Notas generales"
          htmlFor="routine-ai-notes"
          hint="Preferencias, limitaciones o enfoque que quieras que la IA considere."
        >
          <textarea
            id="routine-ai-notes"
            name="notes"
            value={formData.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Ej: priorizar movimientos compuestos, evitar press de hombro"
            rows={4}
            className={TEXTAREA_CLASS}
          />
        </FormField>
      </section>

      <section className="rounded-xl border border-[#3C3C3C] bg-[#222] overflow-hidden">
        <button
          type="button"
          onClick={onToggleAdvanced}
          className="w-full flex items-center justify-between gap-3 min-h-14 px-4 py-3 text-left touch-manipulation active:bg-[#2A2A2A] transition-colors"
          aria-expanded={showAdvanced}
        >
          <span className="text-sm font-semibold text-[#9ED7A7]">Contexto avanzado (opcional)</span>
          <span className="text-sm text-[#B0B0B0] shrink-0" aria-hidden>
            {showAdvanced ? "▲" : "▼"}
          </span>
        </button>

        {showAdvanced && (
          <div className="px-4 pb-4 space-y-5 border-t border-[#3C3C3C] pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <NumberField
                label="Semanas del bloque"
                name="blockWeeks"
                value={formData.blockWeeks}
                min={2}
                max={12}
                onChange={(n) => onChange("blockWeeks", n)}
                hint="Entre 2 y 12"
              />
              <NumberField
                label="Duración por sesión (min)"
                name="sessionDurationMin"
                value={formData.sessionDurationMin}
                min={25}
                max={120}
                onChange={(n) => onChange("sessionDurationMin", n)}
                hint="Entre 25 y 120"
              />
              <NumberField
                label="Sueño promedio (h)"
                name="sleepHours"
                value={formData.sleepHours}
                min={3}
                max={12}
                onChange={(n) => onChange("sleepHours", n)}
              />
              <NumberField
                label="Experiencia (meses)"
                name="trainingAgeMonths"
                value={formData.trainingAgeMonths}
                min={0}
                max={600}
                onChange={(n) => onChange("trainingAgeMonths", n)}
              />
            </div>

            <ChipGroup
              label="Nivel de estrés"
              value={formData.stressLevel}
              onChange={(v) => onChange("stressLevel", v)}
              options={[
                { value: "bajo", label: "Bajo" },
                { value: "medio", label: "Medio" },
                { value: "alto", label: "Alto" },
              ]}
            />

            <FormField label="Fecha objetivo" htmlFor="routine-ai-target-date">
              <Input
                name="targetDate"
                id="routine-ai-target-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => onChange("targetDate", e.target.value)}
                className={FIELD_CLASS}
              />
            </FormField>

            <FormField label="Métrica objetivo" htmlFor="routine-ai-goal-metric">
              <Input
                name="goalMetric"
                id="routine-ai-goal-metric"
                type="text"
                value={formData.goalMetric}
                onChange={(e) => onChange("goalMetric", e.target.value)}
                placeholder="Ej: subir 5 kg en sentadilla en 8 semanas"
                className={FIELD_CLASS}
              />
            </FormField>

            <FormField label="Lesiones o dolor actual" htmlFor="routine-ai-injuries">
              <textarea
                id="routine-ai-injuries"
                name="injuriesOrPain"
                value={formData.injuriesOrPain}
                onChange={(e) => onChange("injuriesOrPain", e.target.value)}
                placeholder="Ej: molestia en hombro derecho al press"
                rows={3}
                className={TEXTAREA_CLASS}
              />
            </FormField>
          </div>
        )}
      </section>
    </div>
  );
}
