import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applicationSources, isApplicationSource, raiseThresholds, verifyScope, verifySummary, verifyThresholdRatchet } from './frontend-coverage.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'fk-frontend-coverage-'));
  for (const name of ['App.tsx', 'unused.ts', 'App.test.tsx', 'sample.spec.js', 'types.d.ts', 'test/helper.ts']) {
    const path = join(root, name);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, 'fixture');
  }
  const app = join(root, 'App.tsx');
  const unused = join(root, 'unused.ts');
  const entry = (path, n) => ({ path, s: { 0: n }, statementMap: { 0: {} } });
  const report = { [app]: entry(app, 1), [unused]: entry(unused, 0) };
  return { root, app, unused, report, entry };
}

const totals = (pct = 6) => ({ total: Object.fromEntries(
  ['lines', 'statements', 'functions', 'branches'].map((key) => [key, { total: 100, covered: pct, pct }]),
) });
const floors = { lines: 4.6, statements: 4.8, functions: 4, branches: 3.6 };

test('scope uključuje neizvršeni app kod i isključuje testove i deklaracije', () => {
  const f = fixture();
  try {
    assert.deepEqual(applicationSources(f.root), [f.app, f.unused]);
    assert.deepEqual(verifyScope(f.root, f.report), { files: 2, executed: 1 });
    assert.equal(isApplicationSource('test/helper.ts'), false);
    assert.equal(isApplicationSource('lib/real.ts'), true);
    delete f.report[f.unused];
    assert.throws(() => verifyScope(f.root, f.report), /nedostaje 1/);
    f.report[f.unused] = f.entry(f.unused, 0);
    const testFile = join(f.root, 'App.test.tsx');
    f.report[testFile] = f.entry(testFile, 1);
    assert.throws(() => verifyScope(f.root, f.report), /višak 1/);
    assert.throws(() => verifyScope(f.root, {}), /nedostaje 2/);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('svaka metrika ima važeći prag i pad ispod njega ruši provjeru', () => {
  const good = totals();
  assert.doesNotThrow(() => verifySummary(good, floors));
  for (const metric of Object.keys(floors)) {
    const bad = structuredClone(good);
    bad.total[metric].pct = floors[metric] - 0.01;
    assert.throws(() => verifySummary(bad, floors), new RegExp(`${metric}:`));
  }
  assert.throws(() => verifySummary({ total: {} }, floors), /Neispravna coverage metrika/);
  assert.throws(() => verifySummary(good, { ...floors, lines: 0 }), /Neispravna coverage metrika/);
});

test('ručni ratchet podiže samo dovoljno izmjerene pragove, nikada ih ne snižava', () => {
  const mixed = totals(6.14);
  mixed.total.lines.pct = 4.64;
  mixed.total.branches.pct = 3.7;
  const next = raiseThresholds(floors, mixed);
  assert.equal(next.lines, 4.6);
  assert.equal(next.branches, 3.6);
  assert.equal(next.statements, 6);
  assert.equal(next.functions, 6);
  for (const metric of Object.keys(floors)) assert.ok(next[metric] >= floors[metric]);
});


test('ratchet poredi svaki prag s prethodnim pushom i odbija sniženje', () => {
  assert.doesNotThrow(() => verifyThresholdRatchet(floors, { ...floors, lines: 4.7 }));
  for (const metric of Object.keys(floors)) {
    assert.throws(() => verifyThresholdRatchet(floors, { ...floors, [metric]: floors[metric] - 0.1 }), /sniženje praga/);
  }
  assert.throws(() => verifyThresholdRatchet(floors, { ...floors, lines: 0 }), /Neispravan/);
  assert.throws(() => verifyThresholdRatchet({}, floors), /Neispravan/);
});
