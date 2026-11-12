import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { compareBudget, measureBudget } from './bundle-budget-measure.mjs';

const cli = resolve('scripts/standards/bundle-budget.mjs');
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'fk-budget-'));
  const dist = join(root, 'dist');
  mkdirSync(join(dist, 'assets'), { recursive: true });
  mkdirSync(join(dist, '.vite'));
  const files = {
    'entry-a.js': 'entry', 'dep-b.js': 'dependency', 'shared-c.js': 'shared',
    'lazy-d.js': 'dynamic chunk', 'main-e.css': 'body { color: red }', 'lazy-f.css': 'p { color: blue }',
  };
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dist, 'assets', name), content);
  const manifest = {
    'index.html': { isEntry: true, file: 'assets/entry-a.js', imports: ['dep', 'shared'], dynamicImports: ['lazy'], css: ['assets/main-e.css'] },
    dep: { file: 'assets/dep-b.js', imports: ['shared'], css: ['assets/main-e.css'] },
    shared: { file: 'assets/shared-c.js', imports: ['dep'] },
    lazy: { file: 'assets/lazy-d.js', css: ['assets/lazy-f.css'] },
  };
  const writeManifest = () => writeFileSync(join(dist, '.vite/manifest.json'), JSON.stringify(manifest));
  writeManifest();
  return { root, dist, manifest, writeManifest, files };
}
const sum = (items, encode = (v) => Buffer.byteLength(v)) => items.reduce((total, v) => total + encode(v), 0);

test('transitivni statički importi, ciklus i CSS se broje jednom; lazy samo u ukupnom', () => {
  const f = fixture();
  try {
    const result = measureBudget(f.dist);
    const initialJs = [f.files['entry-a.js'], f.files['dep-b.js'], f.files['shared-c.js']];
    assert.equal(result.initial.js.raw, sum(initialJs));
    assert.equal(result.initial.js.gzip, sum(initialJs, (s) => gzipSync(s, { level: 6 }).length));
    assert.equal(result.total.js.raw, sum([...initialJs, f.files['lazy-d.js']]));
    assert.equal(result.initial.css.raw, Buffer.byteLength(f.files['main-e.css']));
    assert.equal(result.total.css.raw, sum([f.files['main-e.css'], f.files['lazy-f.css']]));
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('baseline +5% je uključiv; rast preko praga pada', () => {
  const f = fixture();
  try {
    const baseline = measureBudget(f.dist);
    for (const scope of ['initial', 'total']) for (const type of ['js', 'css']) for (const metric of ['raw', 'gzip']) {
      const exact = structuredClone(baseline);
      exact[scope][type][metric] = Math.floor(baseline[scope][type][metric] * 1.05);
      assert.deepEqual(compareBudget(exact, baseline, 5), []);
      exact[scope][type][metric] += 1;
      assert.match(compareBudget(exact, baseline, 5).join(), new RegExp(`${scope}\\.${type}\\.${metric}`));
    }
    assert.throws(() => compareBudget(baseline, {}, 5), /Neispravna metrika/);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('CLI gate zaista prolazi dobar build, pada na rast i nedostajući output', () => {
  const f = fixture();
  try {
    const baseline = measureBudget(f.dist);
    const config = join(f.root, 'baseline.json');
    writeFileSync(config, JSON.stringify({ version: 1, tolerancePercent: 5, baseline }));
    assert.equal(run('--dist', f.dist, '--baseline', config).status, 0);
    writeFileSync(join(f.dist, 'assets/entry-a.js'), 'x'.repeat(300));
    const failed = run('--dist', f.dist, '--baseline', config);
    assert.equal(failed.status, 1);
    assert.match(failed.stderr, /prekoračen/);
    assert.equal(run('--dist', join(f.root, 'missing'), '--baseline', config).status, 1);
    f.manifest['index.html'].imports = ['missing']; f.writeManifest();
    assert.throws(() => measureBudget(f.dist), /Nedostaje manifest import/);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
