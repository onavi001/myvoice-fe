import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined)?.trim();
const ADSENSE_SLOT = (import.meta.env.VITE_ADSENSE_SLOT as string | undefined)?.trim();
const ADSENSE_ENABLED = import.meta.env.VITE_ADSENSE_ENABLED !== "false";

let scriptLoaded = false;

function loadAdSenseScript(client: string): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-adsense-client="${client}"]`);
    if (existing) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.crossOrigin = "anonymous";
    script.dataset.adsenseClient = client;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("AdSense script failed"));
    document.head.appendChild(script);
  });
}

export default function WebAdBanner() {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ENABLED || !ADSENSE_CLIENT || !ADSENSE_SLOT) return undefined;
    let cancelled = false;

    void (async () => {
      try {
        await loadAdSenseScript(ADSENSE_CLIENT);
        if (cancelled || pushedRef.current) return;
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      } catch {
        // Ad blockers or missing config
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ADSENSE_ENABLED || !ADSENSE_CLIENT || !ADSENSE_SLOT) return null;

  return (
    <div className="px-4 py-2 flex justify-center">
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: 90, width: "100%", maxWidth: 728 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
