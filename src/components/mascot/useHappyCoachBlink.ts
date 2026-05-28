import { useEffect, useRef, useState } from "react";
import {
  HAPPY_BLINK_DURATION_MS,
  HAPPY_BLINK_MAX_INTERVAL_MS,
  HAPPY_BLINK_MIN_INTERVAL_MS,
} from "./happyCoachMotion";

/** Schedules natural random blinks for mascot overlays. */
export function useHappyCoachBlink(enabled: boolean): boolean {
  const [blinking, setBlinking] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) {
      setBlinking(false);
      return;
    }

    const clearAll = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };

    const scheduleNext = () => {
      const wait =
        HAPPY_BLINK_MIN_INTERVAL_MS +
        Math.random() * (HAPPY_BLINK_MAX_INTERVAL_MS - HAPPY_BLINK_MIN_INTERVAL_MS);
      const waitId = window.setTimeout(() => {
        setBlinking(true);
        const endId = window.setTimeout(() => {
          setBlinking(false);
          scheduleNext();
        }, HAPPY_BLINK_DURATION_MS);
        timersRef.current.push(endId);
      }, wait);
      timersRef.current.push(waitId);
    };

    scheduleNext();
    return clearAll;
  }, [enabled]);

  return blinking;
}
