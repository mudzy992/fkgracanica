#!/usr/bin/env node
/**
 * INVENTAR — generiše/održava AUDIT/COVERAGE_MATRIX.csv
 * (node scripts/audit/inventory.mjs)
 *
 * Spisak SVIH izvornih fajlova u repu; EXCLUDES ispod je eksplicitan — svaki
 * izuzetak s razlogom. Sačuvane statuse za fajlove koji i dalje postoje; novi
 * ulaze kao `nepregledano`; nestali se uklanjaju uz log. check-coverage.mjs
 * koristi isti scan (R1: fajl mora biti u matrici).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MATRIX = join(ROOT, 'AUDIT', 'COVERAGE_MATRIX.csv');
const COLUMNS = ['file', 'layer', 'module', 'loc', 'status', 'findings', 'segment', 'date'];
const STATUSES = ['nepregledano', 'u toku', 'pregledano', 'popravljeno', 'pokriveno testom'];

/** Izuzeci iz inventara — direktorijumi (regex na relativnu putanju) + razlog. */
const EXCLUDE_DIRS = [
  { re: /(^|\/)node_modules(\/|$)/, reason: 'vendor zavisnosti (npm)' },
  { re: /(^|\/)\.git(\/|$)/, reason: 'git interni podaci' },
  { re: /(^|\/)(dist|build|coverage)(\/|$)/, reason: 'generisani izlazi (dist/build/coverage)' },
  { re: /^\.cursor(\/|$)/, reason: 'konfiguracija/plans alata (dokumentacija — prati se odvojeno)' },
  { re: /^(docs|AUDIT)(\/|$)/, reason: 'dokumentacija (docs/ + AUDIT/ prate se odvojeno)' },
  { re: /^backend\/prisma-mysql-backup(\/|$)/, reason: 'arhivski MySQL backup (rollback materijal, nije aktivni kod)' },
  { re: /^mobile\/assets(\/|$)/, reason: 'binarni resursi (slike/fontovi)' },
  { re: /^frontend\/public(\/|$)/, reason: 'statički web resursi (PWA/ikone) — ne izvorni kod' },
  { re: /^frontend\/src\/assets(\/|$)/, reason: 'statički resursi frontendа' },
  { re: /(^|\/)\.expo(\/|$)/, reason: 'generisani Expo cache' },
];

/** Eksplicitni izuzeci po fajlu (regex na relativnu putanju) + razlog. */
const EXCLUDE_FILES = [
  { re: /^\.env(\..*)?$/, reason: 'env konfiguracija — tajne/primeri prate se u docs/INFRASTRUCTURE.md' },
  { re: /\.json$/, reason: 'json konfiguracije (package-lock F-015/F-016, tsconfig, app.json, eas…)' },
  { re: /\.md$/, reason: 'dokumentacija (docs/ + AUDIT/ prate se odvojeno)' },
  { re: /\.(svg|png|jpg|jpeg|webp|gif|ico|ttf|woff2?)$/, reason: 'binarni resursi' },
  { re: /(^|\/)migration_lock\.toml$/, reason: 'prisma lock konfiguracija (toml)' },
];

/** Ekstenzije koje tretiramo kao izvorni kod. */
const INCLUDE_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.sh', '.sql', '.prisma', '.css', '.yml', '.yaml',
]);

/** Fajlovi bez ekstenzije koje uključujemo. */
const INCLUDE_NAMES = new Set(['Dockerfile', 'docker-compose.yml', 'docker-compose1.yaml', 'pre-push', 'pre-commit', 'commit-msg']);

function layerOf(rel) {
  const top = rel.split(sep)[0];
  if (top === 'backend' || top === 'frontend' || top === 'mobile') return top;
  if (top === 'scripts') return 'scripts';
  return 'infra';
}

function moduleOf(rel, layer) {
  if (layer === 'infra') return 'root';
  if (layer === 'scripts') return 'scripts';
  const parts = rel.split(sep);
  // backend/prisma/** → modul "prisma"; backend/test → "test"
  if (parts[1] === 'prisma') return 'prisma';
  if (parts[1] === 'test') return 'test';
  if (parts.length <= 2) return 'root'; // npr. backend/Dockerfile, frontend/vite.config.ts
  return parts[1];
}

function shouldSkipDir(rel) {
  return EXCLUDE_DIRS.some((e) => e.re.test(rel));
}

function shouldSkipFile(rel) {
  if (EXCLUDE_FILES.some((e) => e.re.test(rel))) return true;
  const base = rel.split(sep).pop();
  if (INCLUDE_NAMES.has(base)) return false;
  const dot = base.lastIndexOf('.');
  const ext = dot >= 0 ? base.slice(dot) : '';
  return !INCLUDE_EXT.has(ext);
}

/** Vraća listu {file, layer, module, loc} (file = posix putanja relativna na ROOT). */
export function scanFiles() {
  const out = [];
  const walk = (absDir) => {
    let entries;
    try {
      entries = readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const abs = join(absDir, e.name);
      const rel = relative(ROOT, abs).split(sep).join('/');
      if (e.isDirectory()) {
        if (!shouldSkipDir(rel)) walk(abs);
      } else if (e.isFile()) {
        if (shouldSkipFile(rel)) continue;
        let loc = 0;
        try {
          loc = readFileSync(abs, 'utf8').split('\n').length;
        } catch {
          loc = 0;
        }
        const layer = layerOf(rel.split('/').join(sep));
        out.push({ file: rel, layer, module: moduleOf(rel.split('/').join(sep), layer), loc });
      }
    }
  };
  walk(ROOT);
  out.sort((a, b) => a.file.localeCompare(b.file));
  return out;
}

function parseCsv(text) {
  const rows = [];
  let i = 0;
  const nextField = () => {
    if (text[i] === '"') {
      i++;
      let s = '';
      while (i < text.length) {
        if (text[i] === '"') {
          if (text[i + 1] === '"') { s += '"'; i += 2; continue; }
          i++; break;
        }
        s += text[i]; i++;
      }
      return s;
    }
    const start = i;
    while (i < text.length && text[i] !== '\n') i++;
    return text.slice(start, i).trim();
  };
  while (i < text.length) {
    const row = [];
    while (i < text.length) {
      row.push(nextField());
      if (i < text.length && text[i] === ',') { i++; continue; }
      break;
    }
    if (i < text.length && text[i] === '\n') i++;
    if (row.some((f) => f !== '')) rows.push(row);
  }
  return rows;
}

const q = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;

function run() {
  const files = scanFiles();
  /** @type {Map<string, string[]>} */
  const prev = new Map();
  if (existsSync(MATRIX)) {
    const rows = parseCsv(readFileSync(MATRIX, 'utf8'));
    for (const r of rows.slice(1)) {
      const obj = Object.fromEntries(COLUMNS.map((c, idx) => [c, r[idx] ?? '']));
      if (obj.file) prev.set(obj.file, r);
    }
  }

  const removed = [...prev.keys()].filter((f) => !files.some((x) => x.file === f));
  const added = files.filter((f) => !prev.has(f.file));

  const lines = [COLUMNS.map(q).join(',')];
  for (const f of files) {
    const old = prev.get(f.file);
    const status = old ? old[4] : 'nepregledano';
    const findings = old ? old[5] : '';
    const segment = old ? old[6] : '';
    const date = old ? old[7] : '';
    lines.push([f.file, f.layer, f.module, f.loc, status, findings, segment, date].map(q).join(','));
  }
  writeFileSync(MATRIX, lines.join('\n') + '\n', 'utf8');

  const byLayer = {};
  for (const f of files) byLayer[f.layer] = (byLayer[f.layer] ?? 0) + 1;
  const done = files.filter((f) => {
    const old = prev.get(f.file);
    return old && STATUSES.includes(old[4]) && old[4] !== 'nepregledano' && old[4] !== 'u toku';
  }).length;

  console.log(`Matrica: ${MATRIX}`);
  console.log(`Ukupno fajlova: ${files.length} | po slojevima: ${JSON.stringify(byLayer)}`);
  console.log(`Pregledano (svi statusi osim nepregledano/u toku): ${done}/${files.length}`);
  if (added.length) console.log(`Novih u matrici: ${added.length} → ${added.slice(0, 10).map((a) => a.file).join(', ')}${added.length > 10 ? ' …' : ''}`);
  if (removed.length) console.log(`Uklonjeno (fajlovi više ne postoje): ${removed.length} → ${removed.slice(0, 10).join(', ')}${removed.length > 10 ? ' …' : ''}`);
  if (!STATUSES.includes('nepregledano')) process.exit(1);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) run();

export { STATUSES, MATRIX, COLUMNS, parseCsv, q, ROOT };
