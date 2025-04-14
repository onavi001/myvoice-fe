import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
export interface WebManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: "fullscreen" | "standalone" | "minimal-ui" | "browser";
  theme_color: string;
  background_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}
const pwaOptions: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
  manifest: {
    name: "My Voice",
    short_name: "MyVoice",
    description: "Tu aplicación para gestionar rutinas de ejercicio personalizadas",
    theme_color: "#34C759",
    background_color: "#1A1A1A",
    display: "standalone",
    start_url: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  } satisfies WebManifest,
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    runtimeCaching: [
      {
        urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith("/api"),
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 día
          },
        },
      },
    ],
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(pwaOptions)],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    proxy: {
      "/api": {
        target: "https://myvoice-be.vercel.app",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});