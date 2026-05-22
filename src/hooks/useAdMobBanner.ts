import { useEffect, useState } from "react";
import type { PluginListenerHandle } from "@capacitor/core";
import { BannerAdPluginEvents } from "@capacitor-community/admob";
import {
  ADMOB_BOTTOM_CLEARANCE_PX,
  ADMOB_MAIN_EXTRA_PADDING_PX,
  ADMOB_MIN_BANNER_HEIGHT_PX,
  ADMOB_SAFE_BUFFER_PX,
  isNativeAndroid,
} from "../services/ads/admobConfig";
import { initializeAdMob, removeAdBanner, showAdBanner } from "../services/ads/admob";

export function useAdMobBanner(show: boolean) {
  const [bannerHeight, setBannerHeight] = useState(0);
  const [bannerActive, setBannerActive] = useState(false);
  const androidNative = isNativeAndroid();

  useEffect(() => {
    if (!show || !androidNative) {
      setBannerHeight(0);
      setBannerActive(false);
      void removeAdBanner();
      return;
    }

    let disposed = false;
    const listeners: PluginListenerHandle[] = [];

    const dismissBanner = () => {
      if (disposed) return;
      setBannerActive(false);
      setBannerHeight(0);
      void removeAdBanner();
    };

    void (async () => {
      const { AdMob } = await import("@capacitor-community/admob");
      const ready = await initializeAdMob();
      if (disposed || !ready) return;

      listeners.push(
        await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
          if (!disposed && size.height > 0) setBannerHeight(size.height);
        }),
        await AdMob.addListener(BannerAdPluginEvents.Closed, dismissBanner),
        await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, dismissBanner)
      );

      if (!disposed) {
        await showAdBanner();
        if (!disposed) setBannerActive(true);
      }
    })();

    return () => {
      disposed = true;
      void Promise.all(listeners.map((l) => l.remove()));
      dismissBanner();
    };
  }, [androidNative, show]);

  const effectiveBannerHeight =
    bannerHeight > 0 ? bannerHeight : bannerActive ? ADMOB_MIN_BANNER_HEIGHT_PX : 0;

  const adBottomInset =
    show && androidNative && bannerActive
      ? ADMOB_BOTTOM_CLEARANCE_PX + effectiveBannerHeight + ADMOB_SAFE_BUFFER_PX
      : 0;

  const contentPaddingBottom =
    show && androidNative ? adBottomInset + ADMOB_MAIN_EXTRA_PADDING_PX : null;

  return { adBottomInset, contentPaddingBottom, bannerHeight, isAndroidNative: androidNative };
}
