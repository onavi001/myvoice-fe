import type { Transition } from "framer-motion";
import type { HappyCoachVariant } from "./HappyCoachIllustration";

export const HAPPY_ART_ASPECT = 512 / 341;

export type HappyCoachFeatures = {
  blink: boolean;
  tailWag: boolean;
  armFlex: boolean;
};

export type TailWagMotion = {
  rotate: number[];
  transition: Transition;
};

export type ArmFlexMotion = {
  scale: number[];
  transition: Transition;
};

const easeSmooth = "easeInOut" as const;

export function getHappyCoachFeatures(
  variant: HappyCoachVariant,
  animated: boolean,
  reduceMotion: boolean | null
): HappyCoachFeatures {
  if (!animated || reduceMotion) {
    return { blink: false, tailWag: false, armFlex: false };
  }
  return {
    blink: true,
    tailWag: variant === "celebrate",
    armFlex: variant === "celebrate",
  };
}

export function getHappyCoachTailWag(
  variant: HappyCoachVariant,
  reduceMotion: boolean | null
): TailWagMotion | null {
  if (reduceMotion) return null;

  switch (variant) {
    case "celebrate":
      return {
        rotate: [0, 16, -14, 16, -10, 0],
        transition: { duration: 0.5, repeat: Infinity, ease: easeSmooth },
      };
    default:
      return null;
  }
}

export function getHappyCoachArmFlex(reduceMotion: boolean | null): ArmFlexMotion | null {
  if (reduceMotion) return null;
  return {
    scale: [1, 1.085, 1, 1.05, 1],
    transition: { duration: 0.85, repeat: Infinity, ease: easeSmooth, repeatDelay: 0.35 },
  };
}

export const HAPPY_BLINK_DURATION_MS = 130;

export const HAPPY_BLINK_MIN_INTERVAL_MS = 2800;
export const HAPPY_BLINK_MAX_INTERVAL_MS = 4800;
