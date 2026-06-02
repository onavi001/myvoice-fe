import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ProgressAchievement } from "../../utils/progressAchievements";
import {
  achievementActionLabel,
  navigateForAchievement,
} from "../../utils/achievementNavigation";
import { useFeaturedMedalOptional } from "../../contexts/FeaturedMedalContext";
import { MEDAL_PALETTES } from "./medals/medalArt";
import MedalShareButton from "./MedalShareButton";
import MyVoiceMedal from "./medals/MyVoiceMedal";

type Props = {
  achievements: ProgressAchievement[];
};

export default function ProgressAchievements({ achievements }: Props) {
  const navigate = useNavigate();
  const featuredCtx = useFeaturedMedalOptional();
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const firstUnlocked = achievements.find((a) => a.unlocked);
    return firstUnlocked?.id ?? achievements[0]?.id ?? null;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const selected = achievements.find((a) => a.id === selectedId) ?? achievements[0];

  if (achievements.length === 0) return null;

  const selectedPalette = selected ? MEDAL_PALETTES[selected.tier] : null;

  const actionLabel = selected ? achievementActionLabel(selected) : null;
  const isWoodMedal = selected?.tier === "starter";

  return (
    <section
      id="logros-medallas"
      className="relative overflow-hidden rounded-xl border border-[#3C3C3C] bg-[#1A1A1A] p-3 scroll-mt-24 [&.mv-medals-scroll-highlight]:ring-2 [&.mv-medals-scroll-highlight]:ring-[#34C759]/70 [&.mv-medals-scroll-highlight]:border-[#34C759]/50 transition-shadow duration-500"
      aria-label="Medallas y logros"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-8 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-[#34C759]/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 top-0 h-20 w-20 rounded-full bg-[#5DD4F7]/8 blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#34C759]">
          Medallas MyVoice
        </h3>
        <span className="rounded-full border border-[#34C759]/30 bg-[#34C759]/10 px-2 py-0.5 text-xs font-semibold text-[#34C759] tabular-nums">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="relative flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory touch-pan-x">
        {achievements.map((achievement) => (
          <button
            key={achievement.id}
            type="button"
            onClick={() => setSelectedId(achievement.id)}
            className={`flex flex-col items-center gap-2 min-w-[80px] snap-center touch-manipulation transition-opacity ${
              selectedId === achievement.id ? "opacity-100" : "opacity-75 hover:opacity-90"
            }`}
            aria-pressed={selectedId === achievement.id}
            aria-label={`${achievement.title}${achievement.unlocked ? ", desbloqueada" : ", bloqueada"}`}
          >
            <MyVoiceMedal
              achievementId={achievement.id}
              tier={achievement.tier}
              unlocked={achievement.unlocked}
              selected={selectedId === achievement.id}
            />
            <span
              className={`text-[10px] text-center font-medium leading-tight max-w-[80px] line-clamp-2 ${
                achievement.unlocked ? "text-[#E0E0E0]" : "text-[#666]"
              }`}
            >
              {achievement.title}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="relative rounded-xl border px-3 py-3 text-sm overflow-hidden"
          style={
            selected.unlocked && selectedPalette
              ? {
                  borderColor: `${selectedPalette.circuit}55`,
                  background: `linear-gradient(135deg, ${selectedPalette.shieldBottom}22 0%, #252525 50%, ${selectedPalette.shieldTop}18 100%)`,
                }
              : undefined
          }
        >
          {selected.unlocked && (
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 20% 0%, ${selectedPalette?.glow ?? "transparent"} 0%, transparent 55%)`,
              }}
              aria-hidden
            />
          )}
          <div className="relative flex items-start gap-3">
            <MyVoiceMedal
              achievementId={selected.id}
              tier={selected.tier}
              unlocked={selected.unlocked}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#E0E0E0] tracking-tight">{selected.title}</p>
              <p
                className={`text-xs mt-1 ${selected.unlocked ? "text-[#B0B0B0]" : "text-[#666]"}`}
              >
                {selected.description}
              </p>
              {!selected.unlocked && selected.action?.kind === "navigate" && actionLabel && (
                <button
                  type="button"
                  onClick={() => navigateForAchievement(navigate, selected)}
                  className={
                    isWoodMedal
                      ? "mt-3 w-full min-h-10 rounded-lg border text-xs font-semibold touch-manipulation"
                      : "mt-3 w-full min-h-10 rounded-lg border border-[#5DD4F7]/50 bg-[#5DD4F7]/15 text-xs font-semibold text-[#5DD4F7] touch-manipulation"
                  }
                  style={
                    isWoodMedal && selectedPalette
                      ? {
                          borderColor: `${selectedPalette.circuit}99`,
                          backgroundColor: `${selectedPalette.shieldMid}28`,
                          color: selectedPalette.rim,
                        }
                      : undefined
                  }
                >
                  {actionLabel}
                </button>
              )}
              {!selected.unlocked && !selected.action && (
                <p className="text-[10px] text-[#5DD4F7]/80 mt-2 font-medium">
                  Entrena con constancia para desbloquear esta medalla.
                </p>
              )}
              {selected.unlocked && (
                <p
                  className={`text-[10px] mt-2 font-semibold uppercase tracking-wide ${
                    isWoodMedal ? "" : "text-[#34C759]"
                  }`}
                  style={isWoodMedal && selectedPalette ? { color: selectedPalette.rim } : undefined}
                >
                  Desbloqueada
                </p>
              )}
              {selected.unlocked && actionLabel && (
                <button
                  type="button"
                  onClick={() => navigateForAchievement(navigate, selected)}
                  className={
                    isWoodMedal
                      ? "mt-3 w-full min-h-10 rounded-lg border text-xs font-semibold touch-manipulation"
                      : "mt-3 w-full min-h-10 rounded-lg border border-[#34C759]/40 bg-[#34C759]/15 text-xs font-semibold text-[#34C759] touch-manipulation"
                  }
                  style={
                    isWoodMedal && selectedPalette
                      ? {
                          borderColor: `${selectedPalette.circuit}99`,
                          backgroundColor: `${selectedPalette.shieldMid}28`,
                          color: selectedPalette.rim,
                        }
                      : undefined
                  }
                >
                  {actionLabel}
                </button>
              )}
              {selected.unlocked && (
                <MedalShareButton achievement={selected} className="mt-3" />
              )}
              {selected.unlocked && featuredCtx && !selected.action && (
                <button
                  type="button"
                  onClick={() => featuredCtx.setFeaturedMedalId(selected.id)}
                  disabled={featuredCtx.isFeaturedInNavbar(selected.id)}
                  className="mt-2 w-full min-h-10 rounded-lg border border-[#5DD4F7]/40 bg-[#5DD4F7]/10 text-xs font-semibold text-[#5DD4F7] touch-manipulation disabled:opacity-60 disabled:border-[#34C759]/40 disabled:bg-[#34C759]/10 disabled:text-[#34C759]"
                >
                  {featuredCtx.isFeaturedInNavbar(selected.id)
                    ? "★ Medalla activa en la barra"
                    : "Mostrar en la barra superior"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
