import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPosition,
  BannerAdSize,
} from "@capacitor-community/admob";
import {
  ADMOB_TOP_MARGIN_PX,
  getBannerAdUnitId,
  getInterstitialAdUnitId,
  isAdMobTesting,
  isNativeAndroid,
} from "./admobConfig";

let initPromise: Promise<boolean> | null = null;
let interstitialPrepared = false;
let interstitialShownThisSession = false;
let interstitialPreloadPromise: Promise<void> | null = null;

const interstitialOptions = () => ({
  adId: getInterstitialAdUnitId(),
  isTesting: isAdMobTesting(),
});

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
    position: BannerAdPosition.TOP_CENTER,
    margin: ADMOB_TOP_MARGIN_PX,
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

/** Preload interstitial when entering Routine AI (once per session until shown). */
export async function preloadRoutineInterstitial(): Promise<void> {
  if (!isNativeAndroid() || interstitialShownThisSession || interstitialPrepared) return;
  if (interstitialPreloadPromise) return interstitialPreloadPromise;

  interstitialPreloadPromise = (async () => {
    const ready = await initializeAdMob();
    if (!ready) return;

    try {
      await AdMob.prepareInterstitial(interstitialOptions());
      interstitialPrepared = true;
    } catch {
      interstitialPrepared = false;
    } finally {
      interstitialPreloadPromise = null;
    }
  })();

  return interstitialPreloadPromise;
}

/** Show at most one interstitial per app session after a successful AI/import generation. */
export async function showRoutineGeneratedInterstitial(): Promise<void> {
  if (!isNativeAndroid() || interstitialShownThisSession) return;

  const ready = await initializeAdMob();
  if (!ready) return;

  try {
    if (!interstitialPrepared) {
      await AdMob.prepareInterstitial(interstitialOptions());
    }
    await AdMob.showInterstitial();
    interstitialShownThisSession = true;
    interstitialPrepared = false;
  } catch {
    interstitialPrepared = false;
  }
}
