import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,

    // Per mitigare crash causato da limite di file watchers in Linux
    watch: {
      ignored: ["**/node_modules/**"],
    },

    // Proxy per smistare le richieste ai microservizi ed evitare problemi di CORS in dev
    proxy: {
      "/api/train": {
        target: "http://localhost:4001",
        changeOrigin: true,
      },
      "/api/generate": {
        target: "http://localhost:4002",
        changeOrigin: true,
      },
      "/api/models": {
        target: "http://localhost:4002",
        changeOrigin: true,
      },
    },
  },
});
