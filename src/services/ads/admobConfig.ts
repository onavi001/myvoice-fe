import { Capacitor } from "@capacitor/core";

/** Google sample app ID (Android). Replace in strings.xml for production. */
export const ADMOB_TEST_APP_ID = "ca-app-pub-3940256099942544~3347511713";

/** Google sample banner unit (Android). */
export const ADMOB_TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";

/** Google sample interstitial (Android). */
export const ADMOB_TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";

/** Space above system nav / chat FAB so the banner does not cover controls (dp). */
export const ADMOB_BOTTOM_CLEARANCE_PX = 72;

/** Base scroll padding when a native banner is visible. */
export const ADMOB_CONTENT_BASE_PADDING_PX = 96;

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export function getBannerAdUnitId(): string {
  const configured = (import.meta.env.VITE_ADMOB_BANNER_ID as string | undefined)?.trim();
  return configured || ADMOB_TEST_BANNER_ID;
}

export function getInterstitialAdUnitId(): string {
  const configured = (import.meta.env.VITE_ADMOB_INTERSTITIAL_ID as string | undefined)?.trim();
  return configured || ADMOB_TEST_INTERSTITIAL_ID;
}

export function isWebPlatform(): boolean {
  return !Capacitor.isNativePlatform();
}

export function isAdMobTesting(): boolean {
  const flag = (import.meta.env.VITE_ADMOB_TESTING as string | undefined)?.trim();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return import.meta.env.DEV;
}
