import { StopCircleIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { playTimerCue, primeTimerAudio } from "../utils/shortBeep";

const PREP_SECONDS = 10;
/** Pitido cada segundo en los últimos N s (prep, serie, descanso). */
const FINAL_SECONDS_BEEP = 5;

interface TimerProps {
  sets: number;
  restTime: number;
  /** Duración de cada serie en segundos. Si no se envía, se usan 30 s (reps por unidad). */
  setDurationSeconds?: number;
  onComplete: () => void;
  onStop: () => void;
  isActive: boolean;
}

export default function Timer({
  sets,
  restTime,
  setDurationSeconds,
  onComplete,
  onStop,
  isActive,
}: TimerProps) {
  const [timer, setTimer] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [phase, setPhase] = useState<"prep" | "work" | "rest" | null>(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const perSetSeconds =
    setDurationSeconds != null && setDurationSeconds > 0 ? setDurationSeconds : 30;

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetUi = () => {
    clearTick();
    setTimer(null);
    setTotalTime(null);
    setPhase(null);
    setCurrentSet(1);
    setAlertMessage(null);
    setShowCongrats(false);
  };

  const startSetPhase = (setNumber: number, totalSets: number, rest: number, workSeconds: number) => {
    let setTime = workSeconds;
    setPhase("work");
    setCurrentSet(setNumber);
    setTimer(setTime);
    setTotalTime(setTime);
    setAlertMessage(null);

    intervalRef.current = setInterval(() => {
      setTime -= 1;
      setTimer(setTime);

      if (setTime > 0 && setTime <= FINAL_SECONDS_BEEP) {
        playTimerCue("work-countdown");
        setAlertMessage(`Quedan ${setTime}s de serie`);
      }

      if (setTime > 0) return;

      clearTick();
      playTimerCue("set-complete");
      setAlertMessage("¡Serie completada!");

      if (setNumber < totalSets) {
        startRestPhase(setNumber + 1, totalSets, rest, workSeconds);
      } else {
        setPhase(null);
        setTimer(null);
        setTotalTime(null);
        playTimerCue("workout-complete");
        setAlertMessage("¡Ejercicio terminado!");
        setShowCongrats(true);
        window.setTimeout(() => {
          if (!mountedRef.current) return;
          setShowCongrats(false);
          onComplete();
        }, 3000);
      }
    }, 1000);
  };

  const startRestPhase = (
    nextSetNumber: number,
    totalSets: number,
    rest: number,
    workSeconds: number
  ) => {
    let restTimeLeft = rest;
    setPhase("rest");
    setCurrentSet(nextSetNumber);
    setTimer(restTimeLeft);
    setTotalTime(restTimeLeft);
    setAlertMessage(null);

    intervalRef.current = setInterval(() => {
      restTimeLeft -= 1;
      setTimer(restTimeLeft);

      if (restTimeLeft > 0 && restTimeLeft <= FINAL_SECONDS_BEEP) {
        playTimerCue("rest-countdown");
        setAlertMessage(`Descanso: ${restTimeLeft}s para la siguiente serie`);
      }

      if (restTimeLeft > 0) return;

      clearTick();
      playTimerCue("rest-complete");
      setAlertMessage("¡Descanso terminado!");
      startSetPhase(nextSetNumber, totalSets, rest, workSeconds);
    }, 1000);
  };

  const startPrepCountdown = (totalSets: number, rest: number, workSeconds: number) => {
    let countdownTime = PREP_SECONDS;
    setPhase("prep");
    setTimer(countdownTime);
    setTotalTime(countdownTime);
    setCurrentSet(1);
    setAlertMessage(`Empieza en ${PREP_SECONDS}s`);

    intervalRef.current = setInterval(() => {
      countdownTime -= 1;
      setTimer(countdownTime);

      if (countdownTime > 0 && countdownTime <= FINAL_SECONDS_BEEP) {
        playTimerCue("prep-countdown");
        setAlertMessage(`Empieza en ${countdownTime}s`);
      }

      if (countdownTime > 0) return;

      clearTick();
      playTimerCue("rest-complete");
      setAlertMessage("¡Comienza ahora!");
      startSetPhase(1, totalSets, rest, workSeconds);
    }, 1000);
  };

  useEffect(() => {
    mountedRef.current = true;

    if (!isActive) {
      resetUi();
      return () => {
        mountedRef.current = false;
        clearTick();
      };
    }

    resetUi();
    void primeTimerAudio();
    startPrepCountdown(sets, restTime, perSetSeconds);

    return () => {
      mountedRef.current = false;
      clearTick();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, sets, restTime, perSetSeconds]);

  const handleStop = () => {
    resetUi();
    onStop();
  };

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = timer !== null && totalTime !== null ? (timer / totalTime) * circumference : circumference;
  const strokeDashoffset = circumference - progress;

  if (!isActive) return null;

  const phaseLabel =
    phase === "prep"
      ? "Preparación"
      : phase === "work"
        ? `Serie ${currentSet} de ${sets}`
        : phase === "rest"
          ? `Descanso · siguiente: serie ${currentSet} de ${sets}`
          : "";

  const phaseColor =
    phase === "prep" ? "#FF9800" : phase === "work" ? "#FFD700" : "#34C759";

  const overlay = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Temporizador de ejercicio"
    >
      <div className="text-center text-white max-w-sm w-full">
        {timer !== null && totalTime !== null && phase && (
          <div className="flex flex-col items-center">
            <svg width="120" height="120" className="relative" aria-hidden>
              <circle cx="60" cy="60" r={radius} stroke="#2D2D2D" strokeWidth="6" fill="none" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={phaseColor}
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 60 60)"
                className="transition-all duration-1000 ease-linear"
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                className="text-2xl font-semibold"
                fill="white"
              >
                {timer} s
              </text>
            </svg>
            <p className="mt-4 text-xl font-bold" style={{ color: phaseColor }}>
              {phaseLabel}
            </p>
          </div>
        )}
        {alertMessage && (
          <div className="text-[#FFD700] bg-[#2D2D2D] p-4 rounded-xl mt-4 text-lg font-medium">
            {alertMessage}
          </div>
        )}
        {showCongrats && (
          <div className="text-[#34C759] bg-[#2D2D2D] p-6 rounded-xl mt-4 text-xl">
            <p className="text-2xl font-bold">🏆 ¡Felicidades, lo lograste!</p>
            <p>¡Gran trabajo completando las series!</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleStop}
          className="mt-6 flex items-center mx-auto bg-[#EF5350] text-white rounded-full px-4 py-2 text-lg hover:bg-[#D32F2F] min-h-12 touch-manipulation"
        >
          <span>Detener</span>
          <StopCircleIcon className="w-6 h-6 ml-2" />
        </button>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
