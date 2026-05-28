import type { HappyCoachVariant } from "./HappyCoachIllustration";

export type PercentBox = {
  left: string;
  top: string;
  width: string;
  height: string;
};

/** Eyelid masks aligned to sclera only (512×341 reference). */
export const HAPPY_BLINK_EYES: Record<HappyCoachVariant, [PercentBox, PercentBox]> = {
  idle: [
    { left: "44.8%", top: "21.8%", width: "4.6%", height: "3.4%" },
    { left: "51.8%", top: "21.8%", width: "4.6%", height: "3.4%" },
  ],
  encourage: [
    { left: "44.8%", top: "21.8%", width: "4.6%", height: "3.4%" },
    { left: "51.8%", top: "21.8%", width: "4.6%", height: "3.4%" },
  ],
  celebrate: [
    { left: "42.2%", top: "18.2%", width: "4.8%", height: "3.6%" },
    { left: "49.5%", top: "18.2%", width: "4.8%", height: "3.6%" },
  ],
};

export const HAPPY_TAIL_LAYOUT: Record<
  HappyCoachVariant,
  { left: string; top: string; width: string; origin: string }
> = {
  idle: { left: "66%", top: "72%", width: "12%", origin: "22% 92%" },
  encourage: { left: "66%", top: "72%", width: "12%", origin: "22% 92%" },
  celebrate: { left: "62%", top: "50%", width: "22%", origin: "18% 90%" },
};

/** Clip polygons over flex arms (celebrate PNG). */
export const HAPPY_ARM_FLEX_CLIPS: Record<
  "left" | "right",
  { clipPath: string; origin: string }
> = {
  left: {
    clipPath: "polygon(24% 18%, 39% 18%, 39% 42%, 24% 42%)",
    origin: "31% 40%",
  },
  right: {
    clipPath: "polygon(57% 12%, 75% 12%, 75% 42%, 57% 42%)",
    origin: "66% 38%",
  },
};
