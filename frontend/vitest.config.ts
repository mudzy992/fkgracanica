import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * FE-02 — frontend test infra.
 *
 * `jsdom` okruženje (React komponente), bez Tailwind plugina (testovi ne
 * renderuju stilove). Testovi: `src/**\/*.{test,spec}.{ts,tsx}`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Usklađeno s Vite buildom: monorepo ima više kopija Reacta.
    dedupe: ['react', 'react-dom'],
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    deps: {
      optimizer: {
        client: {
          enabled: true,
          include: [
            'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime',
            '@testing-library/react', 'react-router-dom', 'react-hook-form', 'react-i18next',
          ],
        },
      },
    },
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
  },
});
