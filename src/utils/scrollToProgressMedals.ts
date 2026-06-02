import { PROGRESS_MEDALS_HASH } from "./progressRoutes";

const HIGHLIGHT_CLASS = "mv-medals-scroll-highlight";

/**
 * Desplaza hasta la sección de medallas. Reintenta hasta que el nodo exista en el DOM.
 */
export function scrollToProgressMedalsSection(
  options: { maxAttempts?: number; intervalMs?: number } = {}
): void {
  const { maxAttempts = 20, intervalMs = 120 } = options;
  let attempts = 0;

  const tryScroll = () => {
    const el = document.getElementById(PROGRESS_MEDALS_HASH);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.remove(HIGHLIGHT_CLASS);
      void el.offsetWidth;
      el.classList.add(HIGHLIGHT_CLASS);
      window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), 2200);
      return;
    }
    attempts += 1;
    if (attempts < maxAttempts) {
      window.setTimeout(tryScroll, intervalMs);
    }
  };

  requestAnimationFrame(() => {
    tryScroll();
  });
}

export type ProgressMedalsLocationState = {
  scrollToMedals?: boolean;
};

export function shouldScrollToProgressMedals(
  hash: string,
  state: unknown
): boolean {
  if (hash === `#${PROGRESS_MEDALS_HASH}`) return true;
  const s = state as ProgressMedalsLocationState | null;
  return Boolean(s?.scrollToMedals);
}
