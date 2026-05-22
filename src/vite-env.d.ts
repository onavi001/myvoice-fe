/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ADMOB_BANNER_ID?: string;
  readonly VITE_ADMOB_INTERSTITIAL_ID?: string;
  readonly VITE_ADMOB_TESTING?: string;
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_ADSENSE_SLOT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
