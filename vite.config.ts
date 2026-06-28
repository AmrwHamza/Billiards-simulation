import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: true,
    host: true,
    port: 5173,
  },
});
