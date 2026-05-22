import { RoutineData } from "../models/Routine";

export type RoutineTemplate = {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  draft: Pick<RoutineData, "name" | "days">;
};

const baseExercise = (
  name: string,
  sets: number,
  reps: number,
  muscles: string[]
): RoutineData["days"][number]["exercises"][number] => ({
  _id: `tpl-ex-${name.replace(/\s+/g, "-").toLowerCase()}`,
  name,
  sets,
  reps,
  weight: 0,
  weightUnit: "kg" as const,
  repsUnit: "count" as const,
  rest: "90",
  tips: [] as string[],
  muscleGroup: muscles,
  completed: false,
  videos: [],
});

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "full-body-3",
    name: "Full body 3 días",
    description: "Cuerpo completo, ideal principiantes o poco tiempo.",
    daysPerWeek: 3,
    draft: {
      name: "Full body 3x",
      days: [
        {
          _id: "tpl-d1",
          dayName: "Día A",
          explanation: "Pierna + empuje + core",
          warmupOptions: ["Movilidad 5 min", "Bici 5 min"],
          musclesWorked: ["Piernas", "Pecho", "Core"],
          exercises: [
            baseExercise("Sentadilla", 3, 10, ["Piernas"]),
            baseExercise("Press banca", 3, 10, ["Pecho"]),
            baseExercise("Remo con mancuerna", 3, 12, ["Espalda"]),
            baseExercise("Plancha", 3, 45, ["Core"]),
          ],
        },
        {
          _id: "tpl-d2",
          dayName: "Día B",
          explanation: "Cadena posterior + tracción",
          warmupOptions: ["Caminata 5 min"],
          musclesWorked: ["Gluteos", "Espalda"],
          exercises: [
            baseExercise("Peso muerto rumano", 3, 10, ["Gluteos"]),
            baseExercise("Dominadas asistidas", 3, 8, ["Espalda"]),
            baseExercise("Press militar", 3, 10, ["Hombros"]),
            baseExercise("Curl femoral", 3, 12, ["Piernas"]),
          ],
        },
        {
          _id: "tpl-d3",
          dayName: "Día C",
          explanation: "Metabólico + accesorios",
          warmupOptions: ["Saltos suaves 3 min"],
          musclesWorked: ["Piernas", "Brazos"],
          exercises: [
            baseExercise("Zancadas", 3, 12, ["Piernas"]),
            baseExercise("Fondos en banco", 3, 12, ["Pecho"]),
            baseExercise("Curl bíceps", 3, 12, ["Biceps"]),
            baseExercise("Crunch", 3, 15, ["Core"]),
          ],
        },
      ],
    },
  },
  {
    id: "ppl-3",
    name: "Push / Pull / Legs",
    description: "Clásica división PPL, 3 sesiones por semana.",
    daysPerWeek: 3,
    draft: {
      name: "Push Pull Legs",
      days: [
        {
          _id: "tpl-push",
          dayName: "Push",
          explanation: "Pecho, hombro, tríceps",
          warmupOptions: ["Rotaciones hombro"],
          musclesWorked: ["Pecho", "Hombros", "Triceps"],
          exercises: [
            baseExercise("Press banca", 4, 8, ["Pecho"]),
            baseExercise("Press inclinado mancuernas", 3, 10, ["Pecho"]),
            baseExercise("Elevaciones laterales", 3, 15, ["Hombros"]),
            baseExercise("Extensiones tríceps", 3, 12, ["Triceps"]),
          ],
        },
        {
          _id: "tpl-pull",
          dayName: "Pull",
          explanation: "Espalda y bíceps",
          warmupOptions: ["Colgarse barra 30s"],
          musclesWorked: ["Espalda", "Biceps"],
          exercises: [
            baseExercise("Dominadas", 4, 8, ["Espalda"]),
            baseExercise("Remo en barra", 4, 10, ["Espalda"]),
            baseExercise("Face pull", 3, 15, ["Hombros"]),
            baseExercise("Curl barra", 3, 12, ["Biceps"]),
          ],
        },
        {
          _id: "tpl-legs",
          dayName: "Pierna",
          explanation: "Cuádriceps, glúteo, femoral",
          warmupOptions: ["Sentadilla vacía 2×10"],
          musclesWorked: ["Piernas", "Gluteos"],
          exercises: [
            baseExercise("Sentadilla", 4, 8, ["Piernas"]),
            baseExercise("Prensa", 3, 12, ["Piernas"]),
            baseExercise("Hip thrust", 3, 10, ["Gluteos"]),
            baseExercise("Curl femoral", 3, 12, ["Piernas"]),
          ],
        },
      ],
    },
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    description: "Torso y pierna alternados, 4 días.",
    daysPerWeek: 4,
    draft: {
      name: "Upper Lower",
      days: [
        {
          _id: "tpl-u1",
          dayName: "Upper A",
          explanation: "",
          warmupOptions: [],
          musclesWorked: ["Pecho", "Espalda"],
          exercises: [
            baseExercise("Press banca", 4, 8, ["Pecho"]),
            baseExercise("Remo", 4, 10, ["Espalda"]),
            baseExercise("Press militar", 3, 10, ["Hombros"]),
          ],
        },
        {
          _id: "tpl-l1",
          dayName: "Lower A",
          explanation: "",
          warmupOptions: [],
          musclesWorked: ["Piernas"],
          exercises: [
            baseExercise("Sentadilla", 4, 8, ["Piernas"]),
            baseExercise("Peso muerto", 3, 8, ["Gluteos"]),
            baseExercise("Gemelos", 4, 15, ["Piernas"]),
          ],
        },
        {
          _id: "tpl-u2",
          dayName: "Upper B",
          explanation: "",
          warmupOptions: [],
          musclesWorked: ["Pecho", "Espalda"],
          exercises: [
            baseExercise("Press inclinado", 4, 10, ["Pecho"]),
            baseExercise("Jalón al pecho", 4, 10, ["Espalda"]),
            baseExercise("Elevaciones laterales", 3, 15, ["Hombros"]),
          ],
        },
        {
          _id: "tpl-l2",
          dayName: "Lower B",
          explanation: "",
          warmupOptions: [],
          musclesWorked: ["Piernas"],
          exercises: [
            baseExercise("Zancadas", 3, 12, ["Piernas"]),
            baseExercise("Hip thrust", 4, 10, ["Gluteos"]),
            baseExercise("Curl femoral", 3, 12, ["Piernas"]),
          ],
        },
      ],
    },
  },
];
