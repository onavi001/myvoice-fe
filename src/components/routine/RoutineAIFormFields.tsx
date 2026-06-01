import type { ReactNode } from "react";
import Input from "../Input";
import SessionPlanPreview from "./SessionPlanPreview";

export type BiologicalSex = "masculino" | "femenino";

export type RoutineAIFormData = {
  biologicalSex: BiologicalSex;
  heightCm: number;
  weightKg: number;
  sessionDurationMin: number;
  level: "principiante" | "intermedio" | "avanzado";
  goal: "fuerza" | "hipertrofia" | "resistencia";
  days: number;
  equipment: "gym" | "casa" | "pesas";
  name: string;
  notes: string;
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
  step,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <FormField label={label} htmlFor={name} hint={hint}>
      <Input
        name={name}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
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
};

export default function RoutineAIFormFields({ formData, onChange }: Props) {
  const dayOptions = [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    value: String(d),
    label: String(d),
  }));

  const durationOptions = [30, 45, 60, 75, 90, 120, 150, 180].map((m) => ({
    value: String(m),
    label: `${m} min`,
  }));

  return (
    <div className="space-y-5">
      <section className="space-y-5 rounded-xl border border-[#34C759]/25 bg-[#34C759]/5 p-4">
        <h2 className="text-sm font-semibold text-[#34C759]">Tu perfil de entrenamiento</h2>

        <ChipGroup
          label="Sexo biológico"
          value={formData.biologicalSex}
          onChange={(v) => onChange("biologicalSex", v)}
          options={[
            { value: "masculino", label: "Masculino" },
            { value: "femenino", label: "Femenino" },
          ]}
          columns={2}
        />

        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="Altura (cm)"
            name="heightCm"
            value={formData.heightCm}
            min={120}
            max={230}
            onChange={(n) => onChange("heightCm", n)}
          />
          <NumberField
            label="Peso (kg)"
            name="weightKg"
            value={formData.weightKg}
            min={30}
            max={250}
            step={0.5}
            onChange={(n) => onChange("weightKg", n)}
          />
        </div>

        <ChipGroup
          label="Tiempo por sesión"
          value={String(formData.sessionDurationMin)}
          onChange={(v) => onChange("sessionDurationMin", Number(v))}
          options={durationOptions}
        />
      </section>

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
        label="Notas para la IA"
        htmlFor="routine-ai-notes"
        hint="Opcional: lesiones, preferencias o ejercicios que quieras evitar."
      >
        <textarea
          id="routine-ai-notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Ej: evitar press de hombro, priorizar pierna"
          rows={3}
          className={TEXTAREA_CLASS}
        />
      </FormField>

      <SessionPlanPreview formData={formData} />
    </div>
  );
}
