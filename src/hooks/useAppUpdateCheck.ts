import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { compareSemver, parseVersionCode } from "../utils/compareAppVersion";
import {
  dismissUpdatePrompt,
  fetchAppVersionConfig,
  wasUpdateDismissed,
  type AppVersionPayload,
} from "../services/appUpdate";

export type AppUpdateState = {
  visible: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  storeUrl: string;
  currentVersion: string;
};

const INITIAL: AppUpdateState = {
  visible: false,
  forceUpdate: false,
  latestVersion: "",
  storeUrl: "",
  currentVersion: "",
};

function needsUpdate(
  currentVersion: string,
  currentBuild: string,
  config: AppVersionPayload
): { required: boolean; force: boolean } {
  const build = parseVersionCode(currentBuild);
  const minCode = config.minVersionCode ?? 0;
  const latestCode = config.latestVersionCode ?? minCode;

  if (compareSemver(currentVersion, config.minVersion) < 0) {
    return { required: true, force: true };
  }
  if (minCode > 0 && build > 0 && build < minCode) {
    return { required: true, force: true };
  }

  if (compareSemver(currentVersion, config.latestVersion) < 0) {
    return { required: true, force: false };
  }
  if (latestCode > 0 && build > 0 && build < latestCode) {
    return { required: true, force: false };
  }

  return { required: false, force: false };
}

export function useAppUpdateCheck(): AppUpdateState & {
  dismiss: () => void;
} {
  const [state, setState] = useState<AppUpdateState>(INITIAL);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    const run = async () => {
      try {
        const platform = Capacitor.getPlatform();
        if (platform !== "android" && platform !== "ios") return;

        const info = await App.getInfo();
        const config = await fetchAppVersionConfig(platform);
        if (cancelled) return;

        const { required, force } = needsUpdate(info.version, info.build, config);
        if (!required) return;

        if (!force && wasUpdateDismissed(config.latestVersion)) return;

        setState({
          visible: true,
          forceUpdate: force,
          latestVersion: config.latestVersion,
          storeUrl: config.storeUrl,
          currentVersion: info.version,
        });
      } catch {
        /* Sin bloquear la app si el API no responde */
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    if (state.latestVersion) dismissUpdatePrompt(state.latestVersion);
    setState((s) => ({ ...s, visible: false }));
  };

  return { ...state, dismiss };
}
