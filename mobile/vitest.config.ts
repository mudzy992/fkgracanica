import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.{ts,tsx,mjs}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx,mjs,cjs}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.d.mts',
        'src/**/*.d.cts',
        'src/**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs}',
        'src/test/**',
      ],
      reporter: ['text-summary', 'json', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
