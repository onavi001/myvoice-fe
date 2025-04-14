import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist", // Asegura que el build se genera en 'dist'
    sourcemap: false, // Desactiva sourcemaps en producción para reducir tamaño
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