import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, join, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const kind = (name) => name.endsWith('.js') ? 'js' : name.endsWith('.css') ? 'css' : null;

function filePath(dist, name) {
  if (typeof name !== 'string' || !name || name.includes('\\')) throw new Error(`Neispravan output: ${name}`);
  const target = resolve(dist, name);
  if (!target.startsWith(`${resolve(dist)}${sep}`)) throw new Error(`Output izvan dist: ${name}`);
  return target;
}

function listAssets(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listAssets(path, base);
    return entry.isFile() && kind(entry.name) ? [relative(base, path).split(sep).join('/')] : [];
  });
}

function sizes(dist, files) {
  const result = { js: { raw: 0, gzip: 0 }, css: { raw: 0, gzip: 0 } };
  for (const name of files) {
    const type = kind(name);
    if (!type) continue;
    const data = readFileSync(filePath(dist, name));
    result[type].raw += data.length;
    result[type].gzip += gzipSync(data, { level: 6 }).length;
  }
  return result;
}

/** Početni graf = index.html + svi statički importi; dinamički nisu initial. */
export function measureBudget(dist) {
  const manifest = JSON.parse(readFileSync(join(dist, '.vite/manifest.json'), 'utf8'));
  if (!manifest['index.html']?.isEntry) throw new Error('Nedostaje index.html entry u Vite manifestu');
  const visited = new Set();
  const initial = new Set();
  function visit(key) {
    if (visited.has(key)) return;
    const chunk = manifest[key];
    if (!chunk || typeof chunk.file !== 'string') throw new Error(`Nedostaje manifest import: ${key}`);
    visited.add(key);
    if (kind(chunk.file)) initial.add(chunk.file);
    for (const css of chunk.css ?? []) initial.add(css);
    for (const dependency of chunk.imports ?? []) visit(dependency);
  }
  visit('index.html');
  const all = new Set(listAssets(join(dist, 'assets'), dist));
  if (!all.size || ![...all].some((f) => f.endsWith('.js')) || ![...all].some((f) => f.endsWith('.css'))) {
    throw new Error('Nedostaje JS ili CSS output');
  }
  for (const name of initial) if (!all.has(name)) throw new Error(`Initial output nije u assets: ${name}`);
  const result = { initial: sizes(dist, initial), total: sizes(dist, all) };
  if (!result.initial.js.raw || !result.total.js.raw || !result.total.css.raw) throw new Error('Prazan JS ili CSS output');
  return result;
}

/** Svaka od osam metrika je nezavisno ograničena; 5% je uključivo. */
export function compareBudget(actual, baseline, tolerancePercent) {
  if (!Number.isFinite(tolerancePercent) || tolerancePercent < 0) throw new Error('Neispravna tolerancija');
  const errors = [];
  for (const scope of ['initial', 'total']) for (const type of ['js', 'css']) for (const metric of ['raw', 'gzip']) {
    const reference = baseline?.[scope]?.[type]?.[metric];
    const value = actual?.[scope]?.[type]?.[metric];
    if (!Number.isSafeInteger(reference) || reference <= 0 || !Number.isSafeInteger(value) || value < 0) {
      throw new Error(`Neispravna metrika: ${scope}.${type}.${metric}`);
    }
    const limit = Math.floor(reference * (100 + tolerancePercent) / 100);
    if (value > limit) errors.push(`${scope}.${type}.${metric}: ${value} B > ${limit} B (baseline ${reference} B)`);
  }
  return errors;
}
