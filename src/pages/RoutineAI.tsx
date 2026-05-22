import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  createDay,
  createRoutine,
  generateRoutine,
  generateRoutineFromImport,
  ThunkError,
} from "../store/routineSlice";
import RoutineAIImportSection, {
  RoutineImportPayload,
} from "../components/routine/RoutineAIImportSection";
import { IRoutine, RoutineData } from "../models/Routine";
import Button from "../components/Button";
import Card from "../components/Card";
import RoutineAIFormFields, { RoutineAIFormData } from "../components/routine/RoutineAIFormFields";
import RoutineAIDraftEditor from "../components/routine/RoutineAIDraftEditor";
import Toast from "../components/Toast";
import { FuturisticLoader } from "../components/Loader";
import { IExercise } from "../models/Exercise";
import { IDay } from "../models/Day";
import { useNavigate } from "react-router-dom";
import { showRoutineGeneratedInterstitial } from "../services/ads/admob";
import FreemiumGateModal from "../components/FreemiumGateModal";
import {
  canUseFeature,
  recordFeatureUsage,
  UsageFeature,
} from "../utils/freemium";
import { useAdMobBottomInset } from "../context/AdMobInsetContext";

type LoadingState = {
  generating: boolean;
  saving: boolean;
};

type CreateMode = "generate" | "import";

const DRAFT_FOOTER_HEIGHT_PX = 148;

export default function RoutineAI() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const adBottomInset = useAdMobBottomInset();
  const { loading } = useSelector((state: RootState) => state.routine);
  const [currentRoutine, setCurrentRoutine] = useState<RoutineData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [createMode, setCreateMode] = useState<CreateMode>("generate");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<RoutineAIFormData>({
    level: "intermedio",
    goal: "hipertrofia",
    days: 3,
    equipment: "gym",
    name: "Rutina de Volumen",
    notes: "Enfocarse en movimientos compuestos",
    blockWeeks: 6,
    sessionDurationMin: 60,
    injuriesOrPain: "",
    goalMetric: "Mejorar fuerza y tecnica en movimientos principales",
    targetDate: "",
    sleepHours: 7,
    stressLevel: "medio",
    trainingAgeMonths: 6,
  });
  const [loadingState, setLoadingState] = useState<LoadingState>({ generating: false, saving: false });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [freemiumFeature, setFreemiumFeature] = useState<UsageFeature | null>(null);

  const handleChange = (field: keyof RoutineAIFormData, value: string | number) => {
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

  const finishGeneration = (routine: RoutineData) => {
    setCurrentRoutine(routine);
    setIsGenerating(false);
    void showRoutineGeneratedInterstitial();
  };

  const handleGenerate = async () => {
    if (!canUseFeature("aiGenerate")) {
      setFreemiumFeature("aiGenerate");
      return;
    }
    setLoadingState((prev) => ({ ...prev, generating: true }));
    setToast(null);
    try {
      const generateRo = await dispatch(generateRoutine(formData)).unwrap();
      recordFeatureUsage("aiGenerate");
      finishGeneration(generateRo);
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
      } else {
        setToast({
          message: error.message || "Error al generar la rutina",
          type: "error",
        });
      }
    } finally {
      setLoadingState((prev) => ({ ...prev, generating: false }));
    }
  };

  const handleImport = async (payload: RoutineImportPayload) => {
    if (!canUseFeature("aiImport")) {
      setFreemiumFeature("aiImport");
      return;
    }
    setLoadingState((prev) => ({ ...prev, generating: true }));
    setToast(null);
    try {
      const imported = await dispatch(
        generateRoutineFromImport({
          name: payload.name,
          notes: payload.notes,
          extractedText: payload.extractedText,
          images: payload.images,
        })
      ).unwrap();
      recordFeatureUsage("aiImport");
      finishGeneration(imported);
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
      } else {
        setToast({
          message: error.message || "No se pudo importar la rutina",
          type: "error",
        });
      }
    } finally {
      setLoadingState((prev) => ({ ...prev, generating: false }));
    }
  };
  const handleSaveRoutine = async () => {
    if (!currentRoutine) return;

    setLoadingState((prev) => ({ ...prev, saving: true }));
    setToast(null);
    let routineId: string | null = null;
    let daysSaved = 0;
    const totalDays = currentRoutine.days.length;
    try {
      const routineResult = await dispatch(
        createRoutine({
          name: currentRoutine.name,
          days: [],
          notes: formData.notes,
        } as unknown as IRoutine)
      ).unwrap();
      routineId = routineResult._id.toString();

      for (const day of currentRoutine.days) {
        const adjustedDay = validateAndAdjustDay(day);
        await dispatch(createDay({ routineId, dayData: adjustedDay })).unwrap();
        daysSaved += 1;
      }

      setToast({ message: "Rutina guardada correctamente", type: "success" });
      setTimeout(() => navigate("/routine"), 1000);
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
      } else if (routineId && daysSaved > 0 && daysSaved < totalDays) {
        setToast({
          message: `Se guardó la rutina con ${daysSaved} de ${totalDays} días. Completa el resto en Mis rutinas.`,
          type: "error",
        });
        setTimeout(() => navigate("/routine"), 2000);
      } else if (routineId && daysSaved === 0) {
        setToast({
          message: "Se creó la rutina vacía. Añade los días desde Mis rutinas o intenta guardar de nuevo.",
          type: "error",
        });
      } else {
        setToast({
          message: error.message || "Error al guardar la rutina",
          type: "error",
        });
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
      blockWeeks: 6,
      sessionDurationMin: 60,
      injuriesOrPain: "",
      goalMetric: "Mejorar fuerza y tecnica en movimientos principales",
      targetDate: "",
      sleepHours: 7,
      stressLevel: "medio",
      trainingAgeMonths: 6,
    });
    setCurrentRoutine(null);
    setIsGenerating(true);
  };

  if (loading) {
    return <FuturisticLoader />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div>
        <link rel="icon" href="/favicon.ico" />
        <title>Generar Rutina - Tu Aplicación</title>
      </div>

      <h1 className="text-xl font-bold text-[#34C759] mb-4 max-w-lg mx-auto">Crear rutina con IA</h1>

      {isGenerating ? (
        <div className="max-w-lg mx-auto space-y-4">
          <div
            className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#222] border border-[#3C3C3C]"
            role="tablist"
            aria-label="Modo de creacion"
          >
            <button
              type="button"
              role="tab"
              aria-selected={createMode === "generate"}
              onClick={() => setCreateMode("generate")}
              className={`min-h-12 rounded-lg text-sm font-semibold transition-colors touch-manipulation ${
                createMode === "generate"
                  ? "bg-[#34C759] text-black"
                  : "text-[#E0E0E0] active:bg-[#2D2D2D]"
              }`}
            >
              Desde cero
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={createMode === "import"}
              onClick={() => setCreateMode("import")}
              className={`min-h-12 rounded-lg text-sm font-semibold transition-colors touch-manipulation ${
                createMode === "import"
                  ? "bg-[#34C759] text-black"
                  : "text-[#E0E0E0] active:bg-[#2D2D2D]"
              }`}
            >
              Desde foto / PDF
            </button>
          </div>

          <Card className="bg-[#252525] border-2 border-[#4A4A4A] p-4 sm:p-5 rounded-xl shadow-md">
            {createMode === "generate" ? (
              <>
                <RoutineAIFormFields
                  formData={formData}
                  onChange={handleChange}
                  showAdvanced={showAdvanced}
                  onToggleAdvanced={() => setShowAdvanced((prev) => !prev)}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={loadingState.generating}
                  className="w-full mt-6 min-h-14 text-base font-semibold bg-[#34C759] text-black rounded-xl hover:bg-[#2ca44e] border border-[#34C759] shadow-md disabled:opacity-50 touch-manipulation"
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
              </>
            ) : (
              <RoutineAIImportSection
                disabled={loadingState.generating}
                onImport={handleImport}
              />
            )}
            {loadingState.generating && createMode === "import" && (
              <p className="mt-4 text-center text-sm text-[#9ED7A7] flex items-center justify-center gap-2">
                <FuturisticLoader />
                Analizando archivos con IA...
              </p>
            )}
          </Card>
        </div>
      ) : (
        currentRoutine && (
          <div
            className="max-w-lg mx-auto"
            style={{
              paddingBottom: `calc(${DRAFT_FOOTER_HEIGHT_PX}px + ${adBottomInset}px + max(1rem, env(safe-area-inset-bottom)))`,
            }}
          >
            <RoutineAIDraftEditor
              routine={currentRoutine}
              onChange={setCurrentRoutine}
            />

            <div
              className="fixed left-0 right-0 z-20 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#1A1A1A]/95 border-t border-[#3C3C3C] backdrop-blur-sm"
              style={{ bottom: adBottomInset }}
            >
              <div className="max-w-lg mx-auto flex flex-col gap-2">
                <Button
                  onClick={handleSaveRoutine}
                  disabled={loadingState.saving || !currentRoutine.name.trim()}
                  className="w-full min-h-14 text-base font-semibold bg-[#34C759] text-black rounded-xl hover:bg-[#2ca44e] border border-[#34C759] shadow-md disabled:opacity-50 touch-manipulation"
                >
                  {loadingState.saving ? (
                    <>
                      <FuturisticLoader />
                      Guardando...
                    </>
                  ) : (
                    "Guardar rutina"
                  )}
                </Button>
                <Button
                  variant="outlineDanger"
                  onClick={handleReset}
                  disabled={loadingState.saving}
                  className="w-full min-h-12 text-sm rounded-xl"
                >
                  Descartar y crear otra
                </Button>
              </div>
            </div>
          </div>
        )
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {freemiumFeature && (
        <FreemiumGateModal feature={freemiumFeature} onClose={() => setFreemiumFeature(null)} />
      )}
    </div>
  );
}