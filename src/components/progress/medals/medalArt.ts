import type { AchievementTier } from "../../../utils/progressAchievements";

/** Paletas alineadas a MyVoice: oscuro, verde #34C759, cyan circuito #5DD4F7 */
export type MedalPalette = {
  shieldTop: string;
  shieldMid: string;
  shieldBottom: string;
  rim: string;
  circuit: string;
  core: string;
  ribbon: string;
  glow: string;
};

export const MEDAL_PALETTES: Record<AchievementTier, MedalPalette> = {
  starter: {
    shieldTop: "#A1887F",
    shieldMid: "#D7B896",
    shieldBottom: "#5D4037",
    rim: "#FFE0B2",
    circuit: "#8D6E63",
    core: "#FFF8E1",
    ribbon: "#3E2723",
    glow: "rgba(215, 184, 150, 0.55)",
  },
  bronze: {
    shieldTop: "#8B5A2B",
    shieldMid: "#CD7F32",
    shieldBottom: "#5C3D1E",
    rim: "#E8A86B",
    circuit: "#A67C52",
    core: "#FFE0B2",
    ribbon: "#6D4C2A",
    glow: "rgba(205, 127, 50, 0.55)",
  },
  silver: {
    shieldTop: "#90A4AE",
    shieldMid: "#CFD8DC",
    shieldBottom: "#546E7A",
    rim: "#ECEFF1",
    circuit: "#5DD4F7",
    core: "#FFFFFF",
    ribbon: "#455A64",
    glow: "rgba(93, 212, 247, 0.45)",
  },
  gold: {
    shieldTop: "#F9A825",
    shieldMid: "#FFD54F",
    shieldBottom: "#E65100",
    rim: "#FFF59D",
    circuit: "#34C759",
    core: "#FFFDE7",
    ribbon: "#F57F17",
    glow: "rgba(52, 199, 89, 0.5)",
  },
  platinum: {
    shieldTop: "#5DD4F7",
    shieldMid: "#34C759",
    shieldBottom: "#0D47A1",
    rim: "#E1F5FE",
    circuit: "#5DD4F7",
    core: "#FFFFFF",
    ribbon: "#1565C0",
    glow: "rgba(93, 212, 247, 0.65)",
  },
};

export type MedalGlyph =
  | "spark"
  | "routine-plus"
  | "ai-sparkles"
  | "week-complete"
  | "streak"
  | "streak-long"
  | "day-chain"
  | "milestone"
  | "plan-shield"
  | "iron-path";

export function glyphForAchievementId(id: string): MedalGlyph {
  switch (id) {
    case "first_routine":
      return "routine-plus";
    case "first_ai_routine":
      return "ai-sparkles";
    case "first_session":
      return "spark";
    case "first_perfect_week":
      return "week-complete";
    case "week_streak_2":
    case "week_streak_4":
      return "streak";
    case "week_streak_8":
    case "week_streak_16":
    case "week_streak_26":
      return "streak-long";
    case "day_streak_7":
      return "day-chain";
    case "days_30":
      return "milestone";
    case "perfect_weeks_4":
      return "plan-shield";
    case "plan_streak_10":
      return "iron-path";
    default:
      return "spark";
  }
}

/** Escudo hexagonal + circuitos decorativos (viewBox 0 0 80 96) */
export function shieldPaths(): {
  outer: string;
  inner: string;
  circuit: string[];
} {
  return {
    outer:
      "M40 4 L68 20 L68 52 L40 72 L12 52 L12 20 Z",
    inner: "M40 14 L60 26 L60 50 L40 62 L20 50 L20 26 Z",
    circuit: [
      "M12 20 L20 26 M68 20 L60 26",
      "M20 50 L12 52 M60 50 L68 52",
      "M40 4 L40 14 M40 62 L40 72",
    ],
  };
}
