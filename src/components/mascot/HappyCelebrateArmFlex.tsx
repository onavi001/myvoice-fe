import { motion, useReducedMotion } from "framer-motion";
import { getHappyCoachArmFlex } from "./happyCoachMotion";
import { HAPPY_ARM_FLEX_CLIPS } from "./happyCoachLayout";

type Props = {
  src: string;
};

/** Subtle flex pulse on celebrate arm regions (clipped from same artwork). */
export default function HappyCelebrateArmFlex({ src }: Props) {
  const reduceMotion = useReducedMotion();
  const flex = getHappyCoachArmFlex(reduceMotion);
  if (!flex) return null;

  const imgClass = "absolute inset-0 w-full h-full object-contain pointer-events-none select-none";

  return (
    <>
      {(["left", "right"] as const).map((side, index) => {
        const { clipPath, origin } = HAPPY_ARM_FLEX_CLIPS[side];
        return (
          <motion.div
            key={side}
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{ clipPath, transformOrigin: origin }}
            animate={{ scale: flex.scale }}
            transition={{
              ...flex.transition,
              delay: index * 0.18,
            }}
            aria-hidden
          >
            <img src={src} alt="" className={imgClass} decoding="async" />
          </motion.div>
        );
      })}
    </>
  );
}
