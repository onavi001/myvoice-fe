import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import MyVoiceMedal from "../progress/medals/MyVoiceMedal";
import EmptyNavbarMedalSlot from "./EmptyNavbarMedalSlot";
import { useFeaturedMedalOptional } from "../../contexts/FeaturedMedalContext";
import { navigateToProgressMedals } from "../../utils/progressRoutes";

export default function NavbarFeaturedMedal() {
  const ctx = useFeaturedMedalOptional();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!ctx) return null;

  const { featuredMedal, unlockedAchievements, setFeaturedMedalId } = ctx;
  const displayMedal = featuredMedal ?? unlockedAchievements[0] ?? null;
  const hasMedals = unlockedAchievements.length > 0 && displayMedal;
  const canPick = unlockedAchievements.length > 1;

  if (!hasMedals) {
    return (
      <div ref={rootRef} className="relative flex items-center">
        <button
          type="button"
          onClick={() => navigateToProgressMedals(navigate)}
          className="group flex items-center rounded-lg border border-[#5DD4F7]/40 bg-gradient-to-r from-[#34C759]/10 to-[#5DD4F7]/10 px-1 py-0.5 touch-manipulation min-h-10 min-w-10 justify-center shadow-[0_0_16px_rgba(93,212,247,0.25)] hover:border-[#34C759]/60 transition-all animate-pulse"
          style={{ animationDuration: "3s" }}
          aria-label="Desbloquea tu primera medalla en Progreso"
        >
          <EmptyNavbarMedalSlot compact />
        </button>
      </div>
    );
  }

  const goToMedals = () => {
    setOpen(false);
    navigateToProgressMedals(navigate);
  };

  const pickerPanel = (
    <>
      <p className="text-[10px] uppercase tracking-wide text-[#888] px-2 py-1">
        Medalla en la barra
      </p>
      <ul className="space-y-1">
        {unlockedAchievements.map((medal) => {
          const active = medal.id === displayMedal.id;
          return (
            <li key={medal.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setFeaturedMedalId(medal.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left touch-manipulation min-h-11 ${
                  active ? "bg-[#34C759]/15 border border-[#34C759]/40" : "hover:bg-[#4A4A4A]"
                }`}
              >
                <MyVoiceMedal
                  achievementId={medal.id}
                  tier={medal.tier}
                  unlocked
                  size="xs"
                />
                <span className="text-xs text-[#E0E0E0] font-medium truncate flex-1">
                  {medal.title}
                </span>
                {active && (
                  <span className="text-[10px] text-[#34C759] shrink-0">Activa</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          navigateToProgressMedals(navigate);
        }}
        className="w-full mt-2 text-center text-xs text-[#5DD4F7] py-2 touch-manipulation min-h-10"
      >
        Ver todas en Progreso
      </button>
    </>
  );

  const mobilePickerPortal =
    open && canPick && typeof document !== "undefined"
      ? createPortal(
          <div ref={portalRef}>
            <button
              type="button"
              className="fixed inset-0 z-[58] bg-black/40 sm:hidden"
              aria-label="Cerrar selector de medalla"
              onClick={() => setOpen(false)}
            />
            <div
              role="listbox"
              aria-label="Elegir medalla para la barra"
              className="fixed left-3 right-3 top-[calc(3.25rem+env(safe-area-inset-top,0px))] z-[60] max-h-[min(70vh,320px)] overflow-y-auto rounded-xl border border-[#4A4A4A] bg-[#2D2D2D] shadow-xl p-2 sm:hidden"
            >
              {pickerPanel}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className="relative flex items-center">
      <div className="flex items-center rounded-lg border border-[#3C3C3C] bg-[#252525]/90 overflow-hidden">
        <button
          type="button"
          onClick={goToMedals}
          className="flex items-center justify-center px-1 py-0.5 touch-manipulation min-h-10 min-w-10 hover:border-[#34C759]/50 transition-colors"
          aria-label={`Medalla destacada: ${displayMedal.title}. Toca para ver tus medallas`}
        >
          <MyVoiceMedal
            achievementId={displayMedal.id}
            tier={displayMedal.tier}
            unlocked
            size="xs"
          />
          <span className="hidden sm:block text-[10px] font-semibold text-[#E0E0E0] max-w-[72px] truncate leading-tight">
            {displayMedal.title}
          </span>
        </button>
        {canPick && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center px-1 min-h-10 border-l border-[#3C3C3C] text-[#888] hover:text-[#E0E0E0] hover:bg-[#3C3C3C]/50 touch-manipulation"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label="Cambiar medalla en la barra"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className={open ? "rotate-180 transition-transform" : "transition-transform"}
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {open && canPick && (
        <div
          role="listbox"
          aria-label="Elegir medalla para la barra"
          className="hidden sm:block absolute right-0 top-full mt-2 z-[60] w-64 max-h-[min(70vh,320px)] overflow-y-auto rounded-xl border border-[#4A4A4A] bg-[#2D2D2D] shadow-xl p-2"
        >
          {pickerPanel}
        </div>
      )}
      {mobilePickerPortal}
    </div>
  );
}
