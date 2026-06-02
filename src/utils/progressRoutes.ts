import type { NavigateFunction } from "react-router-dom";
import type { ProgressMedalsLocationState } from "./scrollToProgressMedals";

export const PROGRESS_MEDALS_HASH = "logros-medallas";

export function navigateToProgressMedals(navigate: NavigateFunction) {
  navigate(
    { pathname: "/progress", hash: PROGRESS_MEDALS_HASH },
    { state: { scrollToMedals: true } satisfies ProgressMedalsLocationState }
  );
}
