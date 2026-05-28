import { HAPPY_COACH_ASSETS } from "./happyCoachAssets";
import type { HappyCoachVariant } from "./HappyCoachIllustration";
import { getHappyCoachFeatures, HAPPY_ART_ASPECT } from "./happyCoachMotion";
import { useHappyCoachBlink } from "./useHappyCoachBlink";
import { useReducedMotion } from "framer-motion";
import HappyBlinkOverlay from "./HappyBlinkOverlay";
import HappyCelebrateArmFlex from "./HappyCelebrateArmFlex";
import HappyTailOverlay from "./HappyTailOverlay";

type Props = {
  variant: HappyCoachVariant;
  className?: string;
  title?: string;
  animated?: boolean;
  onError?: () => void;
};

export default function HappyCoachStage({
  variant,
  className = "",
  title = "Happy, tu coach",
  animated = false,
  onError,
}: Props) {
  const reduceMotion = useReducedMotion();
  const src = HAPPY_COACH_ASSETS[variant];
  const features = getHappyCoachFeatures(variant, animated, reduceMotion);
  const blinking = useHappyCoachBlink(features.blink);

  const imgClass =
    "absolute inset-0 w-full h-full object-contain pointer-events-none select-none";

  return (
    <div
      className={`relative w-full max-h-full mx-auto ${className}`}
      style={{ aspectRatio: HAPPY_ART_ASPECT }}
      role="img"
      aria-label={title}
    >
      <img
        src={src}
        alt={title}
        className={imgClass}
        loading="lazy"
        decoding="async"
        onError={onError}
      />
      {features.blink ? <HappyBlinkOverlay variant={variant} blinking={blinking} /> : null}
      {features.armFlex ? <HappyCelebrateArmFlex src={src} /> : null}
      {features.tailWag ? <HappyTailOverlay variant={variant} /> : null}
    </div>
  );
}
