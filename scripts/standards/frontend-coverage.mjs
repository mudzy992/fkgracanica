#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const METRICS = ['lines', 'statements', 'functions', 'branches'];

/** Testovi, deklaracije i testna infrastruktura nisu aplikacijski izvori. */
export function isApplicationSource(path) {
  const name = path.split(sep).join('/');
  return /\.(?:js|jsx|ts|tsx|mjs|cjs)$/.test(name)
    && !/\.d\.(?:ts|mts|cts)$/.test(name)
    && !/\.(?:test|spec)\.(?:js|jsx|ts|tsx|mjs|cjs)$/.test(name)
    && !name.startsWith('test/');
}

export function applicationSources(src) {
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && isApplicationSource(relative(src, path))) files.push(resolve(path));
    }
  }
  walk(src);
  return files.sort();
}

/** Neizvršeni fajlovi moraju biti u reportu; test/vendor fajlovi ne smiju u nazivnik. */
export function verifyScope(src, report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) throw new Error('Neispravan coverage report');
  const expected = new Set(applicationSources(src));
  if (!expected.size) throw new Error('Nema aplikacijskih izvora');
  const actual = new Set();
  let executed = 0;
  for (const [file, item] of Object.entries(report)) {
    if (!isAbsolute(file) || !item || typeof item !== 'object' || resolve(item.path ?? '') !== resolve(file)
      || !item.s || typeof item.s !== 'object' || !item.statementMap || typeof item.statementMap !== 'object') {
      throw new Error(`Neispravan zapis coveragea: ${file}`);
    }
    actual.add(resolve(file));
    if (Object.values(item.s).some((count) => Number(count) > 0)) executed++;
  }
  const missing = [...expected].filter((file) => !actual.has(file));
  const extra = [...actual].filter((file) => !expected.has(file));
  if (missing.length || extra.length) {
    throw new Error(`Coverage obuhvat nije potpun: nedostaje ${missing.length}, višak ${extra.length}\n`
      + [...missing.slice(0, 5).map((file) => `  nedostaje: ${file}`), ...extra.slice(0, 5).map((file) => `  višak: ${file}`)].join('\n'));
  }
  return { files: expected.size, executed };
}

export function verifySummary(summary, thresholds) {
  for (const metric of METRICS) {
    const value = summary?.total?.[metric];
    const floor = thresholds?.[metric];
    if (!value || !Number.isSafeInteger(value.total) || value.total <= 0
      || !Number.isSafeInteger(value.covered) || value.covered < 0 || value.covered > value.total
      || !Number.isFinite(value.pct) || value.pct < 0 || value.pct > 100
      || !Number.isFinite(floor) || floor <= 0 || floor > 100) {
      throw new Error(`Neispravna coverage metrika: ${metric}`);
    }
    if (value.pct < floor) throw new Error(`${metric}: ${value.pct}% < prag ${floor}%`);
  }
}

/** Nijedna metrika ne smije biti snižena u odnosu na prethodni push. */
export function verifyThresholdRatchet(previous, current) {
  for (const metric of METRICS) {
    const before = previous?.[metric];
    const after = current?.[metric];
    if (!Number.isFinite(before) || before <= 0 || before > 100
      || !Number.isFinite(after) || after <= 0 || after > 100) {
      throw new Error(`Neispravan prethodni/sadašnji prag: ${metric}`);
    }
    if (after < before) throw new Error(`${metric}: sniženje praga ${before}% → ${after}% nije dozvoljeno`);
  }
}

/** Novo dizanje ostavlja najmanje 0,1 pp rezerve; nikada ne snižava postojeći prag. */
export function raiseThresholds(thresholds, summary) {
  const next = { ...thresholds };
  for (const metric of METRICS) {
    const pct = summary.total[metric].pct;
    const candidate = Math.max(0, Math.floor((pct - 0.1 + 1e-9) * 10) / 10);
    next[metric] = Math.max(thresholds[metric], candidate);
  }
  return next;
}

function markdown(scope, summary, thresholds) {
  const rows = METRICS.map((metric) => {
    const { covered, total, pct } = summary.total[metric];
    return `| ${metric} | ${covered}/${total} | ${pct}% | ${thresholds[metric]}% |`;
  });
  return ['## Frontend V8 coverage', '', `Aplikacijski izvori: ${scope.files}; sa izvršenim statementom: ${scope.executed}.`, '',
    '| Metrika | Pokriveno | Izmjereno | Minimalni prag |', '|---|---:|---:|---:|', ...rows, '',
    'Prag je ratchet; status cilja ≥50% određuje izmjerena pokrivenost.'].join('\n');
}

function main(args) {
  const comparePrevious = args.length === 2 && args[0] === '--previous';
  if (!comparePrevious && (args.some((arg) => !['--markdown', '--ratchet'].includes(arg)) || args.length > 1)) {
    throw new Error('Opcije: --markdown, --ratchet ili --previous <baseline.json>');
  }
  const dir = join(ROOT, 'frontend');
  const baselinePath = join(dir, 'coverage-baseline.json');
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const vitest = pkg.devDependencies?.vitest;
  if (baseline.version !== 1 || !/^\d+\.\d+\.\d+$/.test(vitest ?? '') || pkg.devDependencies?.['@vitest/coverage-v8'] !== vitest) {
    throw new Error('Neispravan baseline ili neusklađene verzije Vitesta i V8 providera');
  }
  if (comparePrevious) {
    const previous = JSON.parse(readFileSync(args[1], 'utf8'));
    if (previous.version !== 1) throw new Error('Neispravna verzija prethodnog baselina');
    verifyThresholdRatchet(previous.thresholds, baseline.thresholds);
    console.log('frontend-coverage: ratchet OK — pragovi nisu sniženi');
    return;
  }
  const report = JSON.parse(readFileSync(join(dir, 'coverage/coverage-final.json'), 'utf8'));
  const summary = JSON.parse(readFileSync(join(dir, 'coverage/coverage-summary.json'), 'utf8'));
  const scope = verifyScope(join(dir, 'src'), report);
  verifySummary(summary, baseline.thresholds);
  if (args.includes('--ratchet')) {
    const updated = raiseThresholds(baseline.thresholds, summary);
    if (JSON.stringify(updated) !== JSON.stringify(baseline.thresholds)) {
      baseline.thresholds = updated;
      writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
    }
    console.log(`frontend-coverage: ratchet ${JSON.stringify(updated)} (nikada ne snižava pragove)`);
    return;
  }
  const output = markdown(scope, summary, baseline.thresholds);
  console.log(args.includes('--markdown') ? output : `frontend-coverage: OK\n${output}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(`frontend-coverage: FAIL — ${error.message}`); process.exitCode = 1; }
}
