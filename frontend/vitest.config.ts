import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import coverageBaseline from './coverage-baseline.json' with { type: 'json' };

/**
 * FE-02 — frontend test infra.
 *
 * `jsdom` okruženje (React komponente), bez Tailwind plugina (testovi ne
 * renderuju stilove). Testovi: `src/**\/*.{test,spec}.{ts,tsx,mjs}`.
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
            '@testing-library/react', 'react-router-dom', 'react-hook-form', 'react-i18next', 'lucide-react',
            '@tanstack/react-query', '@tiptap/react', '@tiptap/core', '@tiptap/starter-kit',
            '@tiptap/extension-link', '@tiptap/extension-image', '@tiptap/extension-underline',
            '@tiptap/extension-youtube', '@tiptap/pm/model', '@tiptap/pm/state',
            '@tiptap/pm/view', '@tiptap/pm/transform',
          ],
        },
      },
    },
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx,mjs}'],
    coverage: {
      provider: 'v8',
      // Svi aplikacijski izvori, i oni koje nijedan test nije importovao.
      include: ['src/**/*.{js,jsx,ts,tsx,mjs,cjs}'],
      exclude: [
        'src/**/*.d.ts', 'src/**/*.d.mts', 'src/**/*.d.cts',
        'src/**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs}', 'src/test/**',
      ],
      reporter: ['text-summary', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      thresholds: coverageBaseline.thresholds,
    },
    restoreMocks: true,
  },
});
