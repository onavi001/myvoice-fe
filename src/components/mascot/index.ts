export { default as HappyCoach } from "./HappyCoach";
export type { HappyCoachSize } from "./HappyCoach";
export { default as HappyCoachIllustration } from "./HappyCoachIllustration";
export type { HappyCoachVariant } from "./HappyCoachIllustration";
export {
  getHappyCoachFeatures,
  getHappyCoachTailWag,
  getHappyCoachArmFlex,
  HAPPY_ART_ASPECT,
  HAPPY_BLINK_DURATION_MS,
  HAPPY_BLINK_MIN_INTERVAL_MS,
  HAPPY_BLINK_MAX_INTERVAL_MS,
} from "./happyCoachMotion";
export type { HappyCoachFeatures, TailWagMotion, ArmFlexMotion } from "./happyCoachMotion";
export { HAPPY_BLINK_EYES, HAPPY_TAIL_LAYOUT, HAPPY_ARM_FLEX_CLIPS } from "./happyCoachLayout";
export type { PercentBox } from "./happyCoachLayout";
export { useHappyCoachBlink } from "./useHappyCoachBlink";
