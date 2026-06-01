import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { RoutineAiOnboardingStep } from "../../contexts/RoutineAiOnboardingContext";
import { useRoutineAiOnboarding } from "../../contexts/RoutineAiOnboardingContext";
import Button from "../Button";
import HappyCoach from "../mascot/HappyCoach";

type TargetId =
  | "onboarding-navbar-ai"
  | "onboarding-empty-ai-cta"
  | "onboarding-ai-form"
  | "onboarding-ai-generate"
  | "onboarding-ai-save";

type StepConfig = {
  target: TargetId | null;
  title: string;
  body: string;
  primaryLabel: string;
  showSpotlight: boolean;
};

const STEP_CONFIG: Record<RoutineAiOnboardingStep, StepConfig> = {
  welcome: {
    target: null,
    title: "¡Bienvenido a My Voice!",
    body: "Te guiamos en pocos pasos para crear tu primera rutina personalizada con IA: perfil, objetivos y ejercicios con video.",
    primaryLabel: "Empezar guía",
    showSpotlight: false,
  },
  "go-ai": {
    target: "onboarding-empty-ai-cta",
    title: "Rutina con IA",
    body: "Pulsa el botón verde o, desde cualquier pantalla, el botón azul «Rutina con IA» en la barra superior.",
    primaryLabel: "Siguiente",
    showSpotlight: true,
  },
  "fill-form": {
    target: "onboarding-ai-form",
    title: "Tu perfil de entrenamiento",
    body: "Indica sexo biológico, altura, peso y tiempo por sesión. Luego elige nivel, objetivo, días y equipamiento. La IA adaptará el plan a ti.",
    primaryLabel: "Siguiente",
    showSpotlight: true,
  },
  generate: {
    target: "onboarding-ai-generate",
    title: "Generar con IA",
    body: "Cuando el formulario esté listo, pulsa aquí. La IA creará días, ejercicios y buscará videos en YouTube.",
    primaryLabel: "Entendido",
    showSpotlight: true,
  },
  save: {
    target: "onboarding-ai-save",
    title: "Guarda tu rutina",
    body: "Revisa el borrador y pulsa «Guardar rutina» para verla en Mis Rutinas y empezar a entrenar.",
    primaryLabel: "Listo",
    showSpotlight: true,
  },
};

type Rect = { top: number; left: number; width: number; height: number };

function resolveTarget(step: RoutineAiOnboardingStep, pathname: string): TargetId | null {
  const config = STEP_CONFIG[step];
  if (!config.target) return null;
  if (step === "go-ai" && pathname !== "/routine") {
    return "onboarding-navbar-ai";
  }
  if (step === "go-ai" && pathname === "/routine") {
    const emptyCta = document.getElementById("onboarding-empty-ai-cta");
    if (emptyCta) return "onboarding-empty-ai-cta";
    return "onboarding-navbar-ai";
  }
  return config.target;
}

type Props = {
  step: RoutineAiOnboardingStep;
  pathname: string;
};

export default function RoutineAiOnboardingOverlay({ step, pathname }: Props) {
  const { advance, skip } = useRoutineAiOnboarding();
  const config = STEP_CONFIG[step];
  const [rect, setRect] = useState<Rect | null>(null);

  const updateRect = useCallback(() => {
    const targetId = resolveTarget(step, pathname);
    if (!targetId || !config.showSpotlight) {
      setRect(null);
      return;
    }
    const el = document.getElementById(targetId);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 8;
    setRect({
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [step, pathname, config.showSpotlight]);

  useLayoutEffect(() => {
    updateRect();
  }, [updateRect]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const t = window.setTimeout(updateRect, 350);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      window.clearTimeout(t);
    };
  }, [updateRect]);

  const tooltipTop = rect ? rect.top + rect.height + 12 : undefined;
  const tooltipBottom = rect ? window.innerHeight - rect.top + 12 : undefined;
  const placeAbove = rect ? rect.top + rect.height + 220 > window.innerHeight : false;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {config.showSpotlight && rect && (
        <div
          className="fixed rounded-xl ring-2 ring-[#34C759] pointer-events-none transition-all duration-200"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.78)",
          }}
        />
      )}

      {!config.showSpotlight && (
        <div className="fixed inset-0 bg-black/78" aria-hidden />
      )}

      <div
        className={`relative z-[301] flex flex-col px-4 ${
          config.showSpotlight ? "pointer-events-none flex-1" : "flex-1 items-center justify-center pointer-events-auto"
        }`}
      >
        <div
          className={`pointer-events-auto w-full max-w-md rounded-2xl border-2 border-[#4A4A4A] bg-[#252525] p-4 sm:p-5 shadow-2xl ${
            config.showSpotlight
              ? "fixed left-1/2 -translate-x-1/2 max-h-[min(42vh,320px)] overflow-y-auto"
              : ""
          }`}
          style={
            config.showSpotlight && rect
              ? placeAbove
                ? { bottom: tooltipBottom, maxWidth: "min(28rem, calc(100vw - 2rem))" }
                : { top: tooltipTop, maxWidth: "min(28rem, calc(100vw - 2rem))" }
              : undefined
          }
        >
          {!config.showSpotlight && (
            <div className="mx-auto mb-4 w-28">
              <HappyCoach variant="idle" size="fluid" illustrationOnly animated />
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-wide text-[#34C759]">Guía inicial</p>
          <h2 id="onboarding-title" className="text-lg font-bold text-[#E0E0E0] mt-1">
            {config.title}
          </h2>
          <p className="text-sm text-[#CCCCCC] mt-2 leading-relaxed">{config.body}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={skip}
              className="text-sm text-[#9E9E9E] hover:text-[#E0E0E0] py-2 px-1 text-center sm:text-left"
            >
              Omitir guía
            </button>
            <Button
              type="button"
              onClick={advance}
              className="w-full sm:w-auto min-h-11 bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-xl font-semibold border border-[#2DAF47]"
            >
              {config.primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
