import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPosition,
  BannerAdSize,
} from "@capacitor-community/admob";
import {
  ADMOB_BOTTOM_CLEARANCE_PX,
  getBannerAdUnitId,
  getInterstitialAdUnitId,
  isAdMobTesting,
  isNativeAndroid,
} from "./admobConfig";

let initPromise: Promise<boolean> | null = null;

export async function initializeAdMob(): Promise<boolean> {
  if (!isNativeAndroid()) return false;

  if (!initPromise) {
    initPromise = (async () => {
      await AdMob.initialize({
        initializeForTesting: isAdMobTesting(),
      });

      try {
        let consentInfo = await AdMob.requestConsentInfo();
        if (
          consentInfo.isConsentFormAvailable &&
          consentInfo.status === AdmobConsentStatus.REQUIRED
        ) {
          consentInfo = await AdMob.showConsentForm();
        }
        if (!consentInfo.canRequestAds) {
          return false;
        }
      } catch {
        // UMP optional outside EEA; continue if consent API is unavailable.
      }

      return true;
    })().catch(() => {
      initPromise = null;
      return false;
    });
  }

  return initPromise;
}

export async function showAdBanner(): Promise<void> {
  if (!isNativeAndroid()) return;

  const ready = await initializeAdMob();
  if (!ready) return;

  await AdMob.showBanner({
    adId: getBannerAdUnitId(),
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: ADMOB_BOTTOM_CLEARANCE_PX,
    isTesting: isAdMobTesting(),
  });
}

export async function hideAdBanner(): Promise<void> {
  if (!isNativeAndroid()) return;
  try {
    await AdMob.hideBanner();
  } catch {
    // Banner may not be visible yet.
  }
}

export async function removeAdBanner(): Promise<void> {
  if (!isNativeAndroid()) return;
  try {
    await AdMob.removeBanner();
  } catch {
    // Banner may not exist.
  }
}

export async function showRoutineGeneratedInterstitial(): Promise<void> {
  if (!isNativeAndroid()) return;

  const ready = await initializeAdMob();
  if (!ready) return;

  try {
    await AdMob.prepareInterstitial({
      adId: getInterstitialAdUnitId(),
      isTesting: isAdMobTesting(),
    });
    await AdMob.showInterstitial();
  } catch {
    // No fill or user dismissed early
  }
}
