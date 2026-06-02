import { apiClient } from "../utils/apiClient";

export type AppVersionPayload = {
  platform: "android" | "ios";
  minVersion: string;
  latestVersion: string;
  minVersionCode?: number;
  latestVersionCode?: number;
  storeUrl: string;
};

export async function fetchAppVersionConfig(
  platform: "android" | "ios"
): Promise<AppVersionPayload> {
  return apiClient<AppVersionPayload>(`/api/app/version?platform=${platform}`, {
    auth: false,
  });
}

const PLAY_MARKET_PREFIX = "market://details?id=";
const ANDROID_PACKAGE = "com.onavi001.myvoicefit";

export function openAppStore(storeUrl: string): void {
  const webUrl =
    storeUrl.trim() ||
    `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

  const marketUrl = `${PLAY_MARKET_PREFIX}${ANDROID_PACKAGE}`;

  if (typeof window !== "undefined" && /android/i.test(navigator.userAgent)) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = marketUrl;
    document.body.appendChild(iframe);
    window.setTimeout(() => {
      document.body.removeChild(iframe);
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }, 600);
    return;
  }

  window.open(webUrl, "_blank", "noopener,noreferrer");
}

const DISMISS_KEY_PREFIX = "mv_app_update_dismissed_";

export function wasUpdateDismissed(latestVersion: string): boolean {
  try {
    return localStorage.getItem(`${DISMISS_KEY_PREFIX}${latestVersion}`) === "1";
  } catch {
    return false;
  }
}

export function dismissUpdatePrompt(latestVersion: string): void {
  try {
    localStorage.setItem(`${DISMISS_KEY_PREFIX}${latestVersion}`, "1");
  } catch {
    /* ignore */
  }
}
