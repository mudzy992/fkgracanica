#!/usr/bin/env node
/**
 * layer-deps — arhitekturna pravila slojeva:
 *   - backend ne smije importati frontend/mobile module i obrnuto;
 *   - isto važi za frontend↔mobile.
 * (v1: cross-layer importi; detekcija cikličkih importa — odgođeno, vidi segment CI-01.)
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LAYERS = ['backend', 'frontend', 'mobile'];
const IMPORT_RE = /(?:from\s+|import\s*\(\s*|require\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;

function layerOf(file) {
  const top = file.split('/')[0];
  return LAYERS.includes(top) ? top : null;
}

function trackedFiles() {
  return execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
}

function run() {
  const errors = [];
  for (const file of trackedFiles()) {
    const layer = layerOf(file);
    if (!layer || !/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) continue;
    let text;
    try {
      text = readFileSync(join(ROOT, file), 'utf8');
    } catch {
      continue;
    }
    const forbidden = LAYERS.filter((l) => l !== layer);
    text.split('\n').forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return; // komentar
      let m;
      IMPORT_RE.lastIndex = 0;
      while ((m = IMPORT_RE.exec(line)) !== null) {
        const spec = m[1];
        if (/^(https?:|node:)/.test(spec)) continue;
        for (const other of forbidden) {
          if (new RegExp(`(^|/)${other}/`).test(spec)) {
            errors.push({
              rule: 'layer-deps',
              where: `${file}:${i + 1} → "${spec}"`,
              why: `sloj "${layer}" importuje sloj "${other}" — slojevi moraju biti nezavisni (arhitekturno pravilo)`,
              how: 'prebaci zajednički kod u zajednički sloj (npr. backend/src/common) ili invertuj zavisnost; nikad cross-layer import',
            });
          }
        }
      }
    });
  }
  return errors;
}

function report(errors) {
  if (!errors.length) {
    console.log('layer-deps: OK (nema cross-layer importa; ciklički importi — v2, odgođeno)');
    return 0;
  }
  for (const e of errors) console.error(`  [${e.rule}] GDJE: ${e.where}\n           ZAŠTO: ${e.why}\n           KAKO:  ${e.how}\n`);
  return 1;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(report(run()));
export { run, report };
