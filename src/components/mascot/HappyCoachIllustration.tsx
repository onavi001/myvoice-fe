import { useState } from "react";
import HappyCoachStage from "./HappyCoachStage";

export type HappyCoachVariant = "idle" | "encourage" | "celebrate";

type Props = {
  variant?: HappyCoachVariant;
  className?: string;
  title?: string;
  animated?: boolean;
};

function HappyCoachSvgFallback({
  variant,
  className,
  title,
}: {
  variant: HappyCoachVariant;
  className: string;
  title: string;
}) {
  const stroke = "#0D0D0D";
  const black = "#1A1A1A";
  const tan = "#D4A96A";
  const green = "#34C759";
  const armUp = variant === "celebrate";

  return (
    <svg
      viewBox="0 0 160 180"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <path
        d="M118 108 Q132 96 138 108 Q130 120 114 116 Z"
        fill={black}
        stroke={stroke}
        strokeWidth="3"
      />
      <ellipse cx="80" cy="100" rx="38" ry="28" fill={black} stroke={stroke} strokeWidth="3" />
      <ellipse cx="62" cy="104" rx="14" ry="10" fill={tan} />
      <path
        d="M56 112 Q80 104 104 112 L100 120 Q80 114 60 120 Z"
        fill={green}
        stroke={stroke}
        strokeWidth="2.5"
      />
      {armUp ? (
        <path d="M44 100 L32 72 L46 68 L56 94 Z" fill={tan} stroke={stroke} strokeWidth="3" />
      ) : null}
      <ellipse cx="80" cy="72" rx="28" ry="24" fill={black} stroke={stroke} strokeWidth="3" />
      <ellipse cx="0" cy="12" rx="16" ry="12" fill={tan} transform="translate(80, 72)" />
    </svg>
  );
}

export default function HappyCoachIllustration({
  variant = "idle",
  className = "",
  title = "Happy, tu coach",
  animated = false,
}: Props) {
  const [useFallback, setUseFallback] = useState(false);

  if (useFallback) {
    return <HappyCoachSvgFallback variant={variant} className={className} title={title} />;
  }

  return (
    <HappyCoachStage
      variant={variant}
      className={className}
      title={title}
      animated={animated}
      onError={() => setUseFallback(true)}
    />
  );
}
