import { useEffect, useState } from "react";
import type { PluginListenerHandle } from "@capacitor/core";
import { BannerAdPluginEvents } from "@capacitor-community/admob";
import {
  ADMOB_CONTENT_BASE_PADDING_PX,
  isNativeAndroid,
} from "../services/ads/admobConfig";
import { initializeAdMob, removeAdBanner, showAdBanner } from "../services/ads/admob";

export function useAdMobBanner(show: boolean) {
  const [bannerHeight, setBannerHeight] = useState(0);
  const androidNative = isNativeAndroid();

  useEffect(() => {
    if (!show || !androidNative) {
      setBannerHeight(0);
      void removeAdBanner();
      return;
    }

    let disposed = false;
    let sizeListener: PluginListenerHandle | null = null;

    void (async () => {
      const { AdMob } = await import("@capacitor-community/admob");
      const ready = await initializeAdMob();
      if (disposed || !ready) return;

      sizeListener = await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
        if (!disposed) setBannerHeight(size.height);
      });

      if (!disposed) await showAdBanner();
    })();

    return () => {
      disposed = true;
      void sizeListener?.remove();
      void removeAdBanner();
      setBannerHeight(0);
    };
  }, [androidNative, show]);

  const contentPaddingBottom =
    show && androidNative ? ADMOB_CONTENT_BASE_PADDING_PX + bannerHeight : null;

  return { contentPaddingBottom, bannerHeight, isAndroidNative: androidNative };
}
