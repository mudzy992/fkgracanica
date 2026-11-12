import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { entryKey, uncoveredStatements, validateRegistry, verify } from './dead-guards.mjs';

const report = (rows) => Object.fromEntries(rows.map(([path, counts]) => [path, {
  s: Object.fromEntries(counts.map((count, index) => [String(index), count])),
  statementMap: Object.fromEntries(counts.map((_, index) => [String(index), { start: { line: index + 10 } }])),
}]));

test('nepokriveni statementi se čitaju sa relativnom putanjom i linijom', () => {
  const rows = uncoveredStatements(report([
    ['/repo/frontend/src/a.tsx', [1, 0]],
    ['/repo/frontend/src/b.ts', [3]],
  ]), '/repo');
  assert.deepEqual(rows, [{ file: 'frontend/src/a.tsx', line: 11 }]);
});

test('verify razdvaja neupisane i zastarjele unose', () => {
  const registry = { guards: [{ file: 'a.tsx', line: 11 }, { file: 'b.ts', line: 99 }] };
  const result = verify([{ file: 'a.tsx', line: 11 }, { file: 'c.ts', line: 5 }], registry);
  assert.deepEqual(result.unregistered, ['c.ts:5']);
  assert.deepEqual(result.stale, ['b.ts:99']);
  assert.equal(result.uncovered, 2);
  assert.equal(result.entries, 2);
});

test('validateRegistry traži obavezna polja, postojeći fajl i liniju u granicama', () => {
  const root = mkdtempSync(join(tmpdir(), 'fk-dead-guards-'));
  try {
    writeFileSync(join(root, 'a.tsx'), 'prva\ndruga\n');
    const ok = validateRegistry({ guards: [{ file: 'a.tsx', line: 2, kind: 'x', why: 'y' }] }, root);
    assert.deepEqual(ok, []);
    const problems = validateRegistry({ guards: [
      { file: 'a.tsx', line: 2 },
      { file: 'nema.tsx', line: 1, kind: 'x', why: 'y' },
      { file: 'a.tsx', line: 9, kind: 'x', why: 'y' },
    ] }, root);
    assert.equal(problems.length, 3);
    assert.match(problems[0], /kind/);
    assert.match(problems[1], /ne postoji/);
    assert.match(problems[2], /prelazi/);
    assert.deepEqual(validateRegistry({}, root), ['registar nema `guards` niz']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('stvarni registar je ispravan i ključevi su jedinstveni', async () => {
  const { readFileSync } = await import('node:fs');
  const registry = JSON.parse(readFileSync(new URL('../../AUDIT/dead-guards.json', import.meta.url), 'utf8'));
  assert.deepEqual(validateRegistry(registry), []);
  const keys = registry.guards.map(entryKey);
  assert.equal(new Set(keys).size, keys.length);
  for (const guard of registry.guards) assert.ok(registry.kinds[guard.kind], `nepoznat kind ${guard.kind}`);
});
