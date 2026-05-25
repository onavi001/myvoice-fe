import { createContext, useContext } from "react";

export type AdMobInsets = {
  top: number;
  bottom: number;
};

const defaultInsets: AdMobInsets = { top: 0, bottom: 0 };

export const AdMobInsetContext = createContext<AdMobInsets>(defaultInsets);

export function useAdMobInsets(): AdMobInsets {
  return useContext(AdMobInsetContext);
}

/** @deprecated Use useAdMobInsets().bottom — always 0 with top banner. */
export function useAdMobBottomInset(): number {
  return useContext(AdMobInsetContext).bottom;
}
