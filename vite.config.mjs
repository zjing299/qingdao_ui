import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["vue", "vue-router"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    proxy: {
      "/api": {
        target:
          loadEnv(mode, process.cwd(), "API_PROXY_").API_PROXY_TARGET ||
          "http://127.0.0.1:3010",
        changeOrigin: true,
      },
    },
    warmup: {
      clientFiles: ["./src/main.js"],
    },
  },
  plugins: [vue()],
}));
