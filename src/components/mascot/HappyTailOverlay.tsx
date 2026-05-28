import { motion, useReducedMotion } from "framer-motion";
import type { HappyCoachVariant } from "./HappyCoachIllustration";
import { getHappyCoachTailWag } from "./happyCoachMotion";
import { HAPPY_TAIL_LAYOUT } from "./happyCoachLayout";

type Props = {
  variant: HappyCoachVariant;
};

export default function HappyTailOverlay({ variant }: Props) {
  const reduceMotion = useReducedMotion();
  const layout = HAPPY_TAIL_LAYOUT[variant];
  const tailWag = getHappyCoachTailWag(variant, reduceMotion);
  if (!tailWag) return null;

  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        transformOrigin: layout.origin,
      }}
      animate={{ rotate: tailWag.rotate }}
      transition={tailWag.transition}
      aria-hidden
    >
      <svg viewBox="0 0 40 56" className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 48 Q2 38 4 26 Q8 12 18 6 Q28 2 34 10 Q38 22 32 34 Q26 46 14 52 Q8 54 6 48 Z"
          fill="#141414"
          stroke="#0A0A0A"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
