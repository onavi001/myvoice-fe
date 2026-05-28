import type { HappyCoachVariant } from "./HappyCoachIllustration";

/** Raster mascots (semi-realistic). SVG fallback in HappyCoachIllustration if load fails. */
const v = "7";

export const HAPPY_COACH_ASSETS: Record<HappyCoachVariant, string> = {
  idle: `/assets/happy/happy-coach-idle.png?v=${v}`,
  encourage: `/assets/happy/happy-coach-idle.png?v=${v}`,
  celebrate: `/assets/happy/happy-coach-celebrate.png?v=${v}`,
};
