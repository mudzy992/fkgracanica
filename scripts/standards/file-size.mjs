#!/usr/bin/env node
/**
 * file-size — .cursorrules hard limit: ≤200 linija po fajlu (config ≤400).
 *
 * Poznata odstupanja su u baseline-u (scripts/standards/baselines/file-size.txt)
 * — NOVI fajl preko limita → greška. Baseline postoji da se dug (BE/FE)
 * segmenti ne blokiraju; ukloni baseline red kad fajl spadne ispod limita.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanFiles } from '../audit/inventory.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASELINE = join(HERE, 'baselines', 'file-size.txt');
const LIMIT = 200;
const CONFIG_LIMIT = 400;
/** Primjenjuje se na kod (.ts/.tsx/.js/…); .prisma/.sql/.css su druga pravila (vidi KOMENTAR ispod). */
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const CONFIG_RE = /(^|\/)([^/]*\.config\.[cm]?[jt]s|[^/]*\.registry\.ts|[^/]*oxlintrc[^/]*)$/;

function run() {
  const baseline = existsSync(BASELINE)
    ? new Set(readFileSync(BASELINE, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean))
    : new Set();
  const errors = [];
  for (const f of scanFiles()) {
    if (!CODE_EXT.test(f.file)) continue; // schema.prisma / migration.sql / css — ne dijele se tim pravilom
    const limit = CONFIG_RE.test(f.file) ? CONFIG_LIMIT : LIMIT;
    if (f.loc > limit && !baseline.has(f.file)) {
      errors.push({
        rule: 'file-size',
        where: `${f.file} (${f.loc} linija)`,
        why: `preko limita od ${limit} linija (.cursorrules hard limit) i nije u baseline-u`,
        how: 'podijeli fajl na manje module; ili — ako je dug i odobreno u segmentu — dodaj u baseline',
      });
    }
  }
  return errors;
}

function report(errors) {
  if (!errors.length) {
    console.log('file-size: OK');
    return 0;
  }
  for (const e of errors) console.error(`  [${e.rule}] GDJE: ${e.where}\n           ZAŠTO: ${e.why}\n           KAKO:  ${e.how}\n`);
  return 1;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(report(run()));
export { run, report };
