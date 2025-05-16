import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Interfaz para el manifiesto web
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

// Configuración de la PWA
const pwaOptions: Partial<import("vite-plugin-pwa").VitePWAOptions> = {
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
        "src": "/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ],
  } satisfies WebManifest,
  srcDir: "src",
  filename: "sw.ts",
  workbox: {
    // Patrones de archivos estáticos para cachear
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    runtimeCaching: [
      {
        // Cachear solicitudes a la API
        urlPattern: /\/api\/.*/, // Usar una expresión regular para coincidir con /api/*
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
  plugins: [
    react(),
    tailwindcss(),
    VitePWA(pwaOptions),
  ],
  build: {
    outDir: "dist",
    sourcemap: false, // Desactivar sourcemaps en producción
  },
  server: {
    proxy: {
      "/api": {
        //target: "https://myvoice-be.vercel.app",
        target: "http://localhost:3000", // Cambia esto a la URL de tu backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});