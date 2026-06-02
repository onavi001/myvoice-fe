import type { AchievementTier } from "../../../utils/progressAchievements";
import { MEDAL_PALETTES } from "./medalArt";
import MedalSvg from "./MedalSvg";

type Props = {
  achievementId: string;
  tier: AchievementTier;
  unlocked: boolean;
  size?: "xs" | "sm" | "md";
  selected?: boolean;
};

export default function MyVoiceMedal({
  achievementId,
  tier,
  unlocked,
  size = "md",
  selected = false,
}: Props) {
  const palette = MEDAL_PALETTES[tier];

  const px = size === "xs" ? 44 : size === "sm" ? 64 : 76;
  const height = size === "xs" ? 54 : size === "sm" ? 78 : 92;

  return (
    <div
      className={`relative shrink-0 ${selected ? "scale-105" : ""} transition-transform duration-200`}
      style={{
        width: px,
        height: height,
        filter: unlocked
          ? `drop-shadow(0 0 ${selected ? 14 : 10}px ${palette.glow}) drop-shadow(0 4px 8px rgba(0,0,0,0.45))`
          : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
      }}
    >
      <MedalSvg
        achievementId={achievementId}
        tier={tier}
        unlocked={unlocked}
        width={px}
        height={height}
        idSuffix="ui"
      />

      {unlocked && size !== "xs" && (
        <span
          className="absolute bottom-1 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#1A1A1A] bg-[#34C759] text-[10px] font-bold text-black shadow-md"
          aria-hidden
        >
          ✓
        </span>
      )}
    </div>
  );
}
