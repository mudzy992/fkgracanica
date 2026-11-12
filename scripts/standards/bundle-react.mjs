#!/usr/bin/env node
/**
 * bundle-react — provjera da frontend bundle sadrži SAMO JEDNU kopiju Reacta.
 *
 * ZAŠTO (CI-04 / B-CI04-03, 2026-11-03): monorepo ima dvije kopije Reacta —
 * `mobile` (Expo) pinuje 19.2.3 (hoistano u root `node_modules`), a `frontend`
 * traži `^19.2.7` (19.3.1 u `frontend/node_modules`). Kad `frontend/Dockerfile`
 * počne da gradi iz root workspace-a, Vite je u bundle ubacio obje kopije: dio
 * biblioteka je učitao jednu, aplikacija drugu, pa je stranica pala sa
 * `TypeError: Cannot read properties of null (reading 'useEffect')` (crn ekran).
 * Fix je `resolve.dedupe: ['react', 'react-dom']` u `frontend/vite.config.ts`,
 * a ovaj check sprječava tihu regresiju.
 *
 * KAKO: pročita `frontend/dist/assets/*.js` i izbroji različite React verzije
 * (`version:`19.x.y`` u minifikovanom bundle-u). Više od jedne = greška.
 *
 * Pokretanje: `node scripts/standards/bundle-react.mjs` (poslije `vite build`).
 * Ako `dist/` ne postoji, check je preskočen (npr. `check:all` prije builda).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ASSETS = join(ROOT, 'frontend', 'dist', 'assets');

if (!existsSync(ASSETS)) {
  console.log('bundle-react: SKIP (nema frontend/dist — pokreni `npm run build -w frontend`)');
  process.exit(0);
}

// Minifikovani React 19 emituje: `e.version=`19.3.1`` i `version:`19.3.1``.
const VERSION_RE = /version\s*[:=]\s*[`"'](\d+\.\d+\.\d+)[`"']/g;
const found = new Map();

for (const file of readdirSync(ASSETS).filter((f) => f.endsWith('.js'))) {
  const source = readFileSync(join(ASSETS, file), 'utf8');
  for (const match of source.matchAll(VERSION_RE)) {
    const version = match[1];
    if (!/^19\./.test(version)) continue; // samo React 19 – druge verzije su druge biblioteke
    if (!found.has(version)) found.set(version, new Set());
    found.get(version).add(file);
  }
}

const versions = [...found.keys()].sort();

if (versions.length === 0) {
  console.log('bundle-react: SKIP (nema React verzije u bundle-u — produkcijski build je minifikovan)');
  process.exit(0);
}

if (versions.length > 1) {
  console.error('✗ frontend/dist/assets — bundle sadrži VIŠE kopija Reacta:');
  for (const version of versions) {
    console.error(`    react@${version} → ${[...found.get(version)].join(', ')}`);
  }
  console.error('\n  ZAŠTO: dvije kopije Reacta u istom bundle-u → "Cannot read properties of');
  console.error('         null (reading \'useEffect\')" i crn ekran (React hooks pucaju).');
  console.error('  KAKO:  `resolve.dedupe: [\'react\', \'react-dom\']` u `frontend/vite.config.ts`');
  console.error('         (vidi AUDIT/segments/CI-04.md, B-CI04-03).\n');
  process.exit(1);
}

console.log(`bundle-react: OK (samo react@${versions[0]})`);
