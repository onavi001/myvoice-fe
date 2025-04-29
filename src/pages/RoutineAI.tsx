import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { createDay, createRoutine, generateRoutine, ThunkError } from "../store/routineSlice";
import { IRoutine, RoutineData } from "../models/Routine";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Toast from "../components/Toast";
import { FuturisticLoader } from "../components/Loader";
import { IExercise } from "../models/Exercise";
import { IDay } from "../models/Day";
import { useNavigate } from "react-router-dom";

type FormData = {
  level: "principiante" | "intermedio" | "avanzado";
  goal: "fuerza" | "hipertrofia" | "resistencia";
  days: number;
  equipment: "gym" | "casa" | "pesas";
  name: string;
  notes: string;
};

type LoadingState = {
  generating: boolean;
  saving: boolean;
};

export default function RoutineAI() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.routine);
  const [currentRoutine, setCurrentRoutine] = useState<RoutineData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    level: "intermedio",
    goal: "hipertrofia",
    days: 3,
    equipment: "gym",
    name: "Rutina de Volumen",
    notes: "Enfocarse en movimientos compuestos",
  });
  const [loadingState, setLoadingState] = useState<LoadingState>({ generating: false, saving: false });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getDefaultExercise = (): Partial<IExercise> => ({
    name: "Ejercicio sin nombre",
    sets: 1,
    reps: 1,
    weight: 0,
    weightUnit: "kg",
    repsUnit: "count",
    rest: "",
    tips: [],
    muscleGroup: [],
    completed: false,
    videos: [],
  });

  const validateAndAdjustDay = (day: RoutineData["days"][number]): Partial<IDay> => {
    return {
      dayName: day.dayName?.trim() || "Día sin nombre",
      explanation: day.explanation?.trim() || "",
      warmupOptions: Array.isArray(day.warmupOptions) ? day.warmupOptions : [],
      musclesWorked: Array.isArray(day.musclesWorked) ? day.musclesWorked : [],
      exercises: Array.isArray(day.exercises) && day.exercises.length > 0
        ? (day.exercises as Partial<IExercise>[]).map((ex) => ({
            name: ex.name?.trim() || "Ejercicio sin nombre",
            sets: typeof ex.sets === "number" && ex.sets > 0 ? ex.sets : 1,
            reps: typeof ex.reps === "number" && ex.reps > 0 ? ex.reps : 1,
            weight: typeof ex.weight === "number" && ex.weight > 0 ? ex.weight : 0,
            weightUnit: ex.weightUnit === "kg" || ex.weightUnit === "lb" ? ex.weightUnit : "kg",
            repsUnit: ex.repsUnit === "count" || ex.repsUnit === "seconds" ? ex.repsUnit : "count",
            rest: ex.rest?.trim() || "",
            tips: Array.isArray(ex.tips) ? ex.tips.filter((tip) => typeof tip === "string" && tip.trim()) : [],
            muscleGroup: Array.isArray(ex.muscleGroup) ? ex.muscleGroup.filter((mg) => typeof mg === "string" && mg.trim()) : [],
            completed: ex.completed ?? false,
            videos: Array.isArray(ex.videos) ? ex.videos : [],
          })) as IExercise[]
        : [getDefaultExercise() as IExercise],
    };
  };

  const handleGenerate = async () => {
    setLoadingState((prev) => ({ ...prev, generating: true }));
    setToast(null);
    try {
      const generateRo = await dispatch(generateRoutine(formData)).unwrap();
      setCurrentRoutine(generateRo);
      setIsGenerating(false);
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
      } else {
        setToast({ message: "Error al generar la rutina", type: "error" });
        console.error("Error al generar rutina:", error.message);
      }
    } finally {
      setLoadingState((prev) => ({ ...prev, generating: false }));
    }
  };
  const handleSaveRoutine = async () => {
    if (!currentRoutine) return;

    setLoadingState((prev) => ({ ...prev, saving: true }));
    setToast(null);
    try {
      const routineResult = await dispatch(
        createRoutine({
          name: currentRoutine.name,
          days: [],
          notes: formData.notes,
        } as unknown as IRoutine)
      ).unwrap();
      const routineId = routineResult._id;

      for (const day of currentRoutine.days) {
        const adjustedDay = validateAndAdjustDay(day);
        await dispatch(createDay({ routineId, dayData: adjustedDay })).unwrap();
      }

      setToast({ message: "Rutina guardada correctamente", type: "success" });
      setTimeout(() => navigate("/routine"), 1000);
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
      } else {
        setToast({ message: "Error al guardar la rutina", type: "error" });
        console.error("Error al guardar rutina:", error.message);
      }
    } finally {
      setLoadingState((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleReset = () => {
    setFormData({
      level: "intermedio",
      goal: "hipertrofia",
      days: 3,
      equipment: "gym",
      name: "Rutina de Volumen",
      notes: "Enfocarse en movimientos compuestos",
    });
    setCurrentRoutine(null);
    setIsGenerating(true);
  };

  if (loading) {
    return <FuturisticLoader />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-4">
      <div>
        <link rel="icon" href="/favicon.ico" />
        <title>Generar Rutina - Tu Aplicación</title>
      </div>

      <h1 className="text-lg font-bold text-[#34C759] mb-4">Generar Rutina con IA</h1>

      {isGenerating ? (
        <Card className="max-w-md mx-auto space-y-4 bg-[#252525] border-2 border-[#4A4A4A] p-4 rounded-md">
          <div className="flex items-center gap-4">
            <label className="w-16 text-[#D1D1D1] text-xs font-medium">Nombre:</label>
            <Input
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nombre de la rutina"
              className="flex-1 bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-md text-xs focus:ring-1 focus:ring-[#34C759]"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-16 text-[#D1D1D1] text-xs font-medium">Nivel:</label>
            <select
              value={formData.level}
              onChange={(e) => handleChange("level", e.target.value as FormData["level"])}
              className="flex-1 bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-md text-xs focus:ring-1 focus:ring-[#34C759]"
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-16 text-[#D1D1D1] text-xs font-medium">Objetivo:</label>
            <select
              value={formData.goal}
              onChange={(e) => handleChange("goal", e.target.value as FormData["goal"])}
              className="flex-1 bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-md text-xs focus:ring-1 focus:ring-[#34C759]"
            >
              <option value="fuerza">Fuerza</option>
              <option value="hipertrofia">Hipertrofia</option>
              <option value="resistencia">Resistencia</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-16 text-[#D1D1D1] text-xs font-medium">Días (1-7):</label>
            <Input
              name="days"
              type="number"
              value={formData.days}
              onChange={(e) => handleChange("days", Math.min(Math.max(1, Number(e.target.value)), 7))}
              placeholder="Días"
              className="flex-1 bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-md text-xs focus:ring-1 focus:ring-[#34C759]"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-16 text-[#D1D1D1] text-xs font-medium">Equipo:</label>
            <select
              value={formData.equipment}
              onChange={(e) => handleChange("equipment", e.target.value as FormData["equipment"])}
              className="flex-1 bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-md text-xs focus:ring-1 focus:ring-[#34C759]"
            >
              <option value="gym">Gimnasio</option>
              <option value="casa">Casa</option>
              <option value="pesas">Pesas</option>
            </select>
          </div>
          <div>
            <label className="text-[#D1D1D1] text-xs font-medium">Notas:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Notas"
              className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white p-2 rounded-md text-xs h-20 resize-none focus:ring-1 focus:ring-[#34C759]"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loadingState.generating}
            className="w-full bg-[#34C759] text-black p-2 rounded-md text-xs font-semibold hover:bg-[#2ca44e] border border-[#34C759] shadow-md disabled:opacity-50"
          >
            {loadingState.generating ? (
              <>
                <FuturisticLoader />
                Generando...
              </>
            ) : (
              "Generar Rutina"
            )}
          </Button>
        </Card>
      ) : (
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={handleSaveRoutine}
              disabled={loadingState.saving}
              className="w-full bg-[#34C759] text-black p-2 rounded-md text-xs font-semibold hover:bg-[#2ca44e] border border-[#34C759] shadow-md disabled:opacity-50"
            >
              {loadingState.saving ? (
                <>
                  <FuturisticLoader />
                  Guardando...
                </>
              ) : (
                "Guardar Rutina"
              )}
            </Button>
            <Button
              onClick={handleReset}
              className="w-full bg-[#EF5350] text-white hover:bg-[#D32F2F] p-2 rounded-md text-xs font-semibold border border-[#D32F2F] shadow-md"
            >
              Generar Nueva
            </Button>
          </div>
          {currentRoutine && (
            <h2 className="text-xl font-semibold text-[#34C759] mb-4">{currentRoutine.name}</h2>
          )}
          {currentRoutine?.days.map((day) => (
            <Card key={day._id.toString()} className="mt-4 bg-[#252525] border-2 border-[#4A4A4A] p-4 rounded-md">
              <h3 className="text-lg font-bold">{day.dayName}</h3>
              {day.explanation && <p className="text-[#D1D1D1] text-xs">{day.explanation}</p>}
              <ul className="mt-2 space-y-2">
                {day.exercises.map((ex) => (
                  <li key={ex._id.toString()} className="text-sm text-[#B0B0B0] flex items-center justify-between">
                    <span>
                      {ex.name} - {ex.sets}x{ex.reps} ({ex.weight} {ex.weightUnit}) - Descanso: {ex.rest || "N/A"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={handleSaveRoutine}
              disabled={loadingState.saving}
              className="w-full bg-[#34C759] text-black p-2 rounded-md text-xs font-semibold hover:bg-[#2ca44e] border border-[#34C759] shadow-md disabled:opacity-50"
            >
              {loadingState.saving ? (
                <>
                  <FuturisticLoader />
                  Guardando...
                </>
              ) : (
                "Guardar Rutina"
              )}
            </Button>
            <Button
              onClick={handleReset}
              className="w-full bg-[#EF5350] text-white hover:bg-[#D32F2F] p-2 rounded-md text-xs font-semibold border border-[#D32F2F] shadow-md"
            >
              Generar Nueva
            </Button>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}