import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Keep the original Cloudflare build unchanged. This entry serves the same
// client-side portfolio from a regular static web server on Tencent Cloud.
export default defineConfig({
  root: fileURLToPath(new URL("./tencent/", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public/", import.meta.url)),
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./dist-tencent/", import.meta.url)),
    emptyOutDir: true,
  },
});
