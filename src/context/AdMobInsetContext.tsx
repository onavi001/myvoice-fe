import { createContext, useContext } from "react";

/** Extra space reserved above the native AdMob banner (px). */
export const AdMobInsetContext = createContext(0);

export function useAdMobBottomInset(): number {
  return useContext(AdMobInsetContext);
}
