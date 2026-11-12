#!/usr/bin/env node
/**
 * dead-guards — svaki nepokriveni statement mora biti u registru mrtvih zaštita.
 *
 *   node scripts/audit/dead-guards.mjs [--coverage <fajl>] [--registry <fajl>] [--list]
 *
 * P-FE06-42: coverage je na plafonu, a preostale grane su odbrane koje se kroz
 * UI ne mogu izvršiti. Umjesto `/* v8 ignore *\/` (koji bi sakrio i buduće
 * regresije) svaka takva linija je eksplicitno u `AUDIT/dead-guards.json`.
 * Nova nepokrivena linija van registra = pad; zastario unos = upozorenje.
 *
 * Ako coverage izvještaj ne postoji, provjera se preskače (exit 0) — fajl je
 * gitignored i nastaje tek poslije `npm run test:coverage -w frontend`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const DEFAULT_COVERAGE = join(ROOT, 'frontend', 'coverage', 'coverage-final.json');
const DEFAULT_REGISTRY = join(ROOT, 'AUDIT', 'dead-guards.json');

/** Sve nepokrivene statemente pretvara u `{file,line}` sa putanjom relativnom na ROOT. */
export function uncoveredStatements(report, root = ROOT) {
  const rows = [];
  for (const [path, entry] of Object.entries(report ?? {})) {
    for (const [key, count] of Object.entries(entry?.s ?? {})) {
      if (count !== 0) continue;
      const start = entry?.statementMap?.[key]?.start;
      if (!start || typeof start.line !== 'number') continue;
      rows.push({ file: relative(root, path).split('\\').join('/'), line: start.line });
    }
  }
  return rows;
}

export const entryKey = (entry) => `${entry.file}:${entry.line}`;

/** Provjera registra: svaki unos mora imati file/line/kind/why, a `line` mora postojati u fajlu. */
export function validateRegistry(registry, root = ROOT) {
  const problems = [];
  const guards = registry?.guards;
  if (!Array.isArray(guards)) return ['registar nema `guards` niz'];
  for (const [index, guard] of guards.entries()) {
    const at = `unos #${index + 1}`;
    if (!guard?.file || typeof guard.line !== 'number') {
      problems.push(`${at}: nedostaje \`file\` ili \`line\``);
      continue;
    }
    if (!guard.kind || !guard.why) problems.push(`${at} (${entryKey(guard)}): nedostaje \`kind\` ili \`why\``);
    const path = join(root, guard.file);
    if (!existsSync(path)) {
      problems.push(`${at} (${entryKey(guard)}): fajl ne postoji`);
      continue;
    }
    const lines = readFileSync(path, 'utf8').split('\n').length;
    if (guard.line > lines) problems.push(`${at} (${entryKey(guard)}): linija ${guard.line} prelazi ${lines}`);
  }
  return problems;
}

/** Poredi nepokrivene statemente sa registrom. */
export function verify(rows, registry) {
  const registered = new Set((registry?.guards ?? []).map(entryKey));
  const actual = new Set(rows.map(entryKey));
  return {
    unregistered: [...actual].filter((key) => !registered.has(key)).sort(),
    stale: [...registered].filter((key) => !actual.has(key)).sort(),
    uncovered: actual.size,
    entries: registered.size,
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function parseArgs(argv) {
  const options = { coverage: DEFAULT_COVERAGE, registry: DEFAULT_REGISTRY, list: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--list') options.list = true;
    else if (arg === '--coverage') options.coverage = resolve(argv[(i += 1)]);
    else if (arg === '--registry') options.registry = resolve(argv[(i += 1)]);
    else throw new Error(`nepoznat argument: ${arg}`);
  }
  return options;
}

function run(options = parseArgs(process.argv.slice(2))) {
  const registry = readJson(options.registry);
  const problems = validateRegistry(registry);
  if (problems.length) {
    for (const problem of problems) {
      console.error(`  [dead-guards] GDJE: ${problem}\n           ZAŠTO: registar je neispravan\n           KAKO:  dopuni unos (file, line, kind, why) u AUDIT/dead-guards.json\n`);
    }
    return 1;
  }
  if (options.list) {
    for (const guard of registry.guards) console.log(`${entryKey(guard)} [${guard.kind}] ${guard.why}`);
    return 0;
  }
  if (!existsSync(options.coverage)) {
    console.log(`dead-guards: SKIP (nema ${relative(ROOT, options.coverage)} — pokreni \`npm run test:coverage -w frontend\`)`);
    return 0;
  }
  const result = verify(uncoveredStatements(readJson(options.coverage)), registry);
  if (result.unregistered.length) {
    for (const key of result.unregistered) {
      console.error(`  [dead-guards] GDJE: ${key}\n           ZAŠTO: nepokriveni statement nije u registru mrtvih zaštita\n           KAKO:  pokriti ga testom ili ga dodati u AUDIT/dead-guards.json sa objašnjenjem\n`);
    }
    console.error(`dead-guards: FAIL (${result.unregistered.length} neupisanih, ${result.uncovered} nepokrivenih)`);
    return 1;
  }
  const stale = result.stale.length ? `; ${result.stale.length} zastarjelih unosa — provjeri linije` : '';
  for (const key of result.stale) console.warn(`  [dead-guards] ZASTARJELO: ${key} (sada pokriveno ili pomjereno)`);
  console.log(`dead-guards: OK (${result.uncovered} nepokrivenih, svi u registru${stale})`);
  return 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    process.exit(run());
  } catch (error) {
    console.error(`dead-guards: GREŠKA — ${error.message}`);
    process.exit(1);
  }
}
export { run };
