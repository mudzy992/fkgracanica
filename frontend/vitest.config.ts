import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * FE-02 — frontend test infra.
 *
 * `jsdom` okruženje (React komponente), bez Tailwind plugina (testovi ne
 * renderuju stilove). Testovi: `src/**\/*.{test,spec}.{ts,tsx}`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
  },
});
