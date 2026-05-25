import { Capacitor } from "@capacitor/core";

/** Google sample app ID (Android). Replace in strings.xml for production. */
export const ADMOB_TEST_APP_ID = "ca-app-pub-3940256099942544~3347511713";

/** Google sample banner unit (Android). */
export const ADMOB_TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";

/** Google sample interstitial (Android). */
export const ADMOB_TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";

/**
 * Native banner at TOP_CENTER: margin-top pushes it below the in-app navbar (~56px + padding).
 * Bottom banners overlay the WebView and cannot be avoided with CSS on fixed bottom controls.
 */
export const ADMOB_TOP_MARGIN_PX = 72;

/** Fallback height until SizeChanged fires (adaptive banner). */
export const ADMOB_MIN_BANNER_HEIGHT_PX = 56;

/** Extra gap between banner edge and scrollable content. */
export const ADMOB_SAFE_BUFFER_PX = 12;

/** Scroll padding below main content (chat FAB clearance on web / no native ad). */
export const ADMOB_MAIN_EXTRA_PADDING_PX = 72;

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
