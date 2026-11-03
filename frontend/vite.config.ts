import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  envDir: '..',
  plugins: [react(), tailwindcss()],
  resolve: {
    /**
     * CI-04/B-CI04-03: monorepo ima DVIJE kopije Reacta — `mobile` (Expo) pinuje
     * 19.2.3 (hoistano u root `node_modules`), a `frontend` traži ^19.2.7
     * (19.3.1 u `frontend/node_modules`). Bez dedupe-a dio biblioteka u bundle-u
     * učita jednu kopiju, a aplikacija drugu →
     * `Uncaught TypeError: Cannot read properties of null (reading 'useEffect')`
     * i crn ekran. `dedupe` prisiljava SVE importe `react`/`react-dom` na kopiju
     * koju vidi frontend (19.3.1, ista verzija za oba paketa).
     */
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
