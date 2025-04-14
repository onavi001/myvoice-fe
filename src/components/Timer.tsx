import { StopCircleIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

interface TimerProps {
  sets: number;
  restTime: number;
  onComplete: () => void;
  onStop: () => void;
  isActive: boolean;
}

export default function Timer({ sets, restTime, onComplete, onStop, isActive }: TimerProps) {
  const [timer, setTimer] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [phase, setPhase] = useState<"start" | "sets" | "rest" | null>(null);
  const [setsLeft, setSetsLeft] = useState<number>(sets);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (isActive && !intervalId) {
      startCountdown(sets, restTime);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive]);

  const startCountdown = (initialSets: number, rest: number) => {
    let countdownTime = 10;
    setPhase("start");
    setTimer(countdownTime);
    setTotalTime(countdownTime);
    setSetsLeft(initialSets);
    const beep = new Audio("/alarms/countdown.mp3");
    beep.play().catch((error) => console.error("Error al reproducir beep:", error));

    const countdownInterval = setInterval(() => {
      countdownTime -= 1;
      setTimer(countdownTime);
      if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        setAlertMessage("¡Comienza ahora!");
        startSetPhase(initialSets, rest);
      }
    }, 1000);
    setIntervalId(countdownInterval);
  };

  const startSetPhase = (remainingSets: number, rest: number) => {
    let setTime = 30;
    setPhase("sets");
    setTimer(setTime);
    setTotalTime(setTime);

    const interval = setInterval(() => {
      setTime -= 1;
      setTimer(setTime);
      if (setTime <= 0) {
        clearInterval(interval);
        setAlertMessage("¡Serie completada!");
        if (remainingSets > 1) {
          setSetsLeft(remainingSets - 1);
          startRestPhase(remainingSets - 1, rest);
        } else {
          setTimer(null);
          setTotalTime(null);
          setIntervalId(null);
          setPhase(null);
          setAlertMessage("¡Ejercicio terminado!");
          setShowCongrats(true);
          setTimeout(() => {
            setShowCongrats(false);
            onComplete();
          }, 3000);
        }
      }
    }, 1000);
    setIntervalId(interval);
  };

  const startRestPhase = (remainingSets: number, rest: number) => {
    let restTimeLeft = rest;
    setPhase("rest");
    setTimer(restTimeLeft);
    setTotalTime(restTimeLeft);

    const restInterval = setInterval(() => {
      restTimeLeft -= 1;
      setTimer(restTimeLeft);

      if (restTimeLeft === 11) {
        const beep = new Audio("/alarms/countdown.mp3");
        beep.play().catch((error) => console.error("Error al reproducir beep:", error));
      }

      if (restTimeLeft <= 0) {
        clearInterval(restInterval);
        setAlertMessage("¡Descanso terminado! Siguiente serie.");
        setSetsLeft(remainingSets);
        startSetPhase(remainingSets, rest);
      }
    }, 1000);
    setIntervalId(restInterval);
  };

  const handleStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setTimer(null);
      setTotalTime(null);
      setIntervalId(null);
      setPhase(null);
      setAlertMessage(null);
      setShowCongrats(false);
      onStop();
    }
  };

  const radius = 50; // Aumentamos el tamaño para mejor visibilidad
  const circumference = 2 * Math.PI * radius;
  const progress = timer !== null && totalTime !== null ? (timer / totalTime) * circumference : circumference;
  const strokeDashoffset = circumference - progress;

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center text-white">
        {timer !== null && totalTime !== null && (
          <div className="flex flex-col items-center">
            <svg width="120" height="120" className="relative">
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#2D2D2D"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={phase === "start" ? "#FF9800" : phase === "sets" ? "#FFD700" : "#34C759"}
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
                className="text-white font-semibold text-2xl"
                fill="white"
              >
                {timer} s
              </text>
            </svg>
            <p
              className={`mt-4 text-xl font-bold ${
                phase === "start" ? "text-[#FF9800]" : phase === "sets" ? "text-[#FFD700]" : "text-[#34C759]"
              }`}
            >
              {phase === "start"
                ? "¡Preparándote!"
                : phase === "sets"
                ? `Serie ${sets - setsLeft + 1} de ${sets}`
                : `Descanso (${setsLeft} series restantes)`}
            </p>
          </div>
        )}
        {alertMessage && (
          <div className="text-[#FFD700] bg-[#2D2D2D] p-4 rounded-md mt-4 animate-pulse text-lg">
            {alertMessage}
          </div>
        )}
        {showCongrats && (
          <div className="text-[#34C759] bg-[#2D2D2D] p-6 rounded-md mt-4 animate-congrats text-xl">
            <p className="text-2xl font-bold">🏆 ¡Felicidades, lo lograste!</p>
            <p>¡Gran trabajo completando las series!</p>
          </div>
        )}
        <button
          onClick={handleStop}
          className="mt-6 flex items-center mx-auto bg-[#EF5350] text-white rounded-full px-4 py-2 text-lg hover:bg-[#D32F2F]"
        >
          <span>Detener</span>
          <StopCircleIcon className="w-6 h-6 ml-2" />
        </button>
      </div>
    </div>
  );
}