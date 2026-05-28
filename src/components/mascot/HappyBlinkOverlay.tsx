import { motion } from "framer-motion";
import type { HappyCoachVariant } from "./HappyCoachIllustration";
import { HAPPY_BLINK_EYES } from "./happyCoachLayout";

type Props = {
  variant: HappyCoachVariant;
  blinking: boolean;
};

/** Eyelids: scaleY 0 = open (hidden), 1 = closed during blink. Origin at top so lids close downward. */
export default function HappyBlinkOverlay({ variant, blinking }: Props) {
  const eyes = HAPPY_BLINK_EYES[variant];

  return (
    <div className="absolute inset-0 z-20 pointer-events-none" aria-hidden>
      {eyes.map((eye, i) => (
        <motion.div
          key={i}
          className="absolute rounded-[40%] bg-[#1A1A1A]"
          style={{
            left: eye.left,
            top: eye.top,
            width: eye.width,
            height: eye.height,
            transformOrigin: "50% 0%",
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: blinking ? 1 : 0 }}
          transition={{
            duration: blinking ? 0.07 : 0.12,
            ease: blinking ? "easeIn" : "easeOut",
          }}
        />
      ))}
    </div>
  );
}
