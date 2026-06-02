import type { AchievementTier } from "../../../utils/progressAchievements";
import {
  glyphForAchievementId,
  MEDAL_PALETTES,
  shieldPaths,
  type MedalGlyph,
  type MedalPalette,
} from "./medalArt";

export type MedalSvgProps = {
  achievementId: string;
  tier: AchievementTier;
  unlocked: boolean;
  width: number;
  height: number;
  /** Sufijo único para ids de gradiente (evita colisiones al exportar) */
  idSuffix?: string;
};

function CenterGlyph({
  kind,
  palette,
  dimmed,
}: {
  kind: MedalGlyph;
  palette: MedalPalette;
  dimmed: boolean;
}) {
  const fill = dimmed ? "#4A4A4A" : palette.core;
  const accent = dimmed ? "#555" : palette.circuit;
  const stroke = dimmed ? "#333" : "#0D0D0D";

  switch (kind) {
    case "spark":
      return (
        <g transform="translate(40, 38)">
          <circle r="10" fill={accent} opacity={dimmed ? 0.3 : 0.35} />
          <path
            d="M0 -14 L3 -4 L13 0 L3 4 L0 14 L-3 4 L-13 0 L-3 -4 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </g>
      );
    case "routine-plus":
      return (
        <g transform="translate(40, 38)">
          <circle r="11" fill={accent} opacity={dimmed ? 0.2 : 0.25} />
          <path
            d="M0 -8 V8 M-8 0 H8"
            stroke={fill}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      );
    case "ai-sparkles":
      return (
        <g transform="translate(40, 38)">
          <path
            d="M0 -10 L2 -3 L9 0 L2 3 L0 10 L-2 3 L-9 0 L-2 -3 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.2"
          />
          <circle cx="10" cy="-8" r="2" fill={accent} />
          <circle cx="-9" cy="7" r="1.5" fill={accent} opacity={0.85} />
        </g>
      );
    case "week-complete":
      return (
        <g transform="translate(40, 38)">
          <circle r="12" fill="none" stroke={accent} strokeWidth="2.5" opacity={0.8} />
          <path
            d="M-6 0 L-2 4 L8 -6"
            fill="none"
            stroke={fill}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case "streak":
      return (
        <g transform="translate(40, 40)">
          <path
            d="M0 -12 C6 -8 8 0 0 10 C-8 0 -6 -8 0 -12Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M0 -6 L0 2 M-4 0 L4 0"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.9}
          />
        </g>
      );
    case "streak-long":
      return (
        <g transform="translate(40, 38)">
          <path
            d="M-10 8 L-6 -6 L0 2 L6 -10 L10 8 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M-14 10 L14 10"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    case "day-chain":
      return (
        <g transform="translate(40, 40)">
          {[-12, -4, 4, 12].map((x, i) => (
            <circle
              key={i}
              cx={x}
              cy={i % 2 === 0 ? -2 : 4}
              r="3.5"
              fill={i < 3 && !dimmed ? palette.circuit : fill}
              stroke={stroke}
              strokeWidth="1"
            />
          ))}
          <path
            d="M-12 -2 L-4 4 L4 -2 L12 4"
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            opacity={0.7}
          />
        </g>
      );
    case "milestone":
      return (
        <g transform="translate(40, 38)">
          <path
            d="M-10 10 L0 -14 L10 10 L6 10 L6 6 L-6 6 L-6 10 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="-6" y="2" width="12" height="4" rx="1" fill={accent} opacity={0.85} />
        </g>
      );
    case "plan-shield":
      return (
        <g transform="translate(40, 38)">
          <path
            d="M0 -12 L10 -4 L10 8 L0 14 L-10 8 L-10 -4 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          {[-6, -2, 2, 6].map((x) => (
            <line
              key={x}
              x1={x}
              y1="-2"
              x2={x}
              y2="6"
              stroke={accent}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </g>
      );
    case "iron-path":
      return (
        <g transform="translate(40, 38)">
          <rect x="-3" y="-10" width="6" height="20" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <rect x="-12" y="-6" width="5" height="12" rx="1.5" fill={accent} stroke={stroke} strokeWidth="1" />
          <rect x="7" y="-6" width="5" height="12" rx="1.5" fill={accent} stroke={stroke} strokeWidth="1" />
          <circle cx="0" cy="-12" r="2" fill={palette.circuit} />
          <circle cx="0" cy="12" r="2" fill={palette.circuit} />
        </g>
      );
    default:
      return null;
  }
}

export default function MedalSvg({
  achievementId,
  tier,
  unlocked,
  width,
  height,
  idSuffix = "default",
}: MedalSvgProps) {
  const palette = MEDAL_PALETTES[tier];
  const glyph = glyphForAchievementId(achievementId);
  const { outer, inner, circuit } = shieldPaths();
  const dimmed = !unlocked;

  const gradId = `shield-${achievementId}-${tier}-${idSuffix}`;
  const glowId = `glow-${achievementId}-${tier}-${idSuffix}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 96"
      width={width}
      height={height}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={dimmed ? "#3A3A3A" : palette.shieldTop} />
          <stop offset="50%" stopColor={dimmed ? "#2D2D2D" : palette.shieldMid} />
          <stop offset="100%" stopColor={dimmed ? "#1A1A1A" : palette.shieldBottom} />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="35%" r="55%">
          <stop
            offset="0%"
            stopColor={unlocked ? palette.core : "#444"}
            stopOpacity={unlocked ? 0.35 : 0.1}
          />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </radialGradient>
      </defs>

      <path
        d="M22 76 L40 88 L58 76 L58 82 L40 94 L22 82 Z"
        fill={dimmed ? "#2A2A2A" : palette.ribbon}
        stroke={dimmed ? "#444" : "#0D0D0D"}
        strokeWidth="1"
      />
      <path
        d="M28 76 L40 84 L52 76"
        fill="none"
        stroke={dimmed ? "#555" : palette.rim}
        strokeWidth="1"
        opacity="0.6"
      />

      <path d={outer} fill={`url(#${gradId})`} stroke={dimmed ? "#444" : palette.rim} strokeWidth="2" />
      <path
        d={inner}
        fill={`url(#${glowId})`}
        stroke={dimmed ? "#333" : palette.circuit}
        strokeWidth="1"
        opacity={unlocked ? 1 : 0.5}
      />

      {circuit.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={dimmed ? "#3A3A3A" : palette.circuit}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={unlocked ? 0.85 : 0.35}
        />
      ))}
      {unlocked && (
        <>
          <circle cx="40" cy="18" r="2" fill={palette.circuit} opacity="0.9" />
          <circle cx="22" cy="26" r="1.5" fill={palette.circuit} opacity="0.7" />
          <circle cx="58" cy="26" r="1.5" fill={palette.circuit} opacity="0.7" />
        </>
      )}

      <CenterGlyph kind={glyph} palette={palette} dimmed={dimmed} />

      {dimmed && (
        <g opacity="0.5">
          <rect x="26" y="30" width="28" height="22" rx="4" fill="#1A1A1A" opacity="0.6" />
          <path
            d="M40 34 L40 46 M34 40 L46 40"
            stroke="#666"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
