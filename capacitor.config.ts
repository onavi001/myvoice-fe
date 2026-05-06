import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.onavi001.myvoicefit",
  appName: "My Voice",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
