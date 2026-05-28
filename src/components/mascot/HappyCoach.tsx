import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import HappyCoachIllustration, { HappyCoachVariant } from "./HappyCoachIllustration";
import {
  getHappyCoachMessage,
  HappyCoachMessageKey,
} from "./happyCoachCopy";

export type HappyCoachSize = "sm" | "md" | "lg" | "xl" | "fluid";

const sizePx: Record<Exclude<HappyCoachSize, "fluid">, { w: number; h: number }> = {
  sm: { w: 72, h: 90 },
  md: { w: 104, h: 128 },
  lg: { w: 140, h: 172 },
  xl: { w: 200, h: 248 },
};

type Props = {
  variant?: HappyCoachVariant;
  size?: HappyCoachSize;
  message?: string;
  messageKey?: HappyCoachMessageKey;
  messageParams?: { streak?: number };
  layout?: "horizontal" | "stacked";
  className?: string;
  /** Blink, tail (celebrate), arm flex (celebrate) */
  animated?: boolean;
  illustrationOnly?: boolean;
  showName?: boolean;
};

export default function HappyCoach({
  variant = "idle",
  size = "md",
  message,
  messageKey,
  messageParams,
  layout = "horizontal",
  className = "",
  animated = true,
  illustrationOnly = false,
  showName = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isFluid = size === "fluid";

  const text = useMemo(() => {
    if (message) return message;
    if (messageKey) return getHappyCoachMessage(messageKey, messageParams);
    return "";
  }, [message, messageKey, messageParams]);

  const illustration = (
    <motion.div
      className="shrink-0"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {isFluid ? (
        <HappyCoachIllustration
          variant={variant}
          animated={animated}
          className="w-full h-auto"
        />
      ) : (
        <div
          style={{ width: sizePx[size].w, height: sizePx[size].h }}
          className="flex items-end justify-center"
        >
          <HappyCoachIllustration
            variant={variant}
            animated={animated}
            className="w-full h-full max-h-full"
          />
        </div>
      )}
    </motion.div>
  );

  if (illustrationOnly) {
    return (
      <div className={className} role="complementary" aria-label="Happy, tu coach">
        {illustration}
      </div>
    );
  }

  const body = (
    <div className="min-w-0 flex-1">
      {showName && (
        <p className="text-xs font-semibold uppercase tracking-wide text-[#34C759] mb-0.5">
          Happy
        </p>
      )}
      {text ? (
        <p className="text-sm text-[#D1D1D1] leading-snug">{text}</p>
      ) : null}
    </div>
  );

  if (layout === "stacked") {
    return (
      <div
        className={`flex flex-col items-center text-center gap-3 ${className}`}
        role="complementary"
        aria-label="Happy, tu coach"
      >
        {illustration}
        {body}
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 ${className}`}
      role="complementary"
      aria-label="Happy, tu coach"
    >
      {illustration}
      {body}
    </div>
  );
}
