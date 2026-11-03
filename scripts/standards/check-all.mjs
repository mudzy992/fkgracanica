#!/usr/bin/env node
/**
 * check:all — pokreće SVE audit provjere (jedna komanda, lokalno + CI).
 *
 *   node scripts/standards/check-all.mjs    (ili: npm run check:all)
 *
 * Sadržaj (svaka provjera je i zaseban CLI):
 *   1. audit/check-coverage.mjs  — matrica pokrivenosti (pravilo 4)
 *   2. file-size                 — ≤200/400 linija (baseline: scripts/standards/baselines/)
 *   3. console-ban               — nema console.log/debug/info u src
 *   3b. token-check              — design tokeni (boje samo u index.css @theme; ratchet palete)
 *   4. secrets-ban               — nema novih tajni u trackanim fajlovima
 *   5. layer-deps                — nema cross-layer importa
 *   6. docs-links                — nema mrtvih relativnih linkova u docs/ i README
 *   7. docker-context            — Docker build kontekst: COPY putanje postoje, nema stranog locka
 *
 * Izlaz: KOJE / GDJE / ZAŠTO / KAKO po odstupanju; exit 1 ako bilo koji check padne.
 */
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

const CHECKS = [
  { name: 'check-coverage', script: join(ROOT, 'scripts', 'audit', 'check-coverage.mjs') },
  { name: 'file-size', script: join(HERE, 'file-size.mjs') },
  { name: 'console-ban', script: join(HERE, 'console-ban.mjs') },
  { name: 'token-check', script: join(HERE, 'token-check.mjs') },
  { name: 'secrets-ban', script: join(HERE, 'secrets-ban.mjs') },
  { name: 'layer-deps', script: join(HERE, 'layer-deps.mjs') },
  { name: 'docs-links', script: join(HERE, 'docs-links.mjs') },
  { name: 'docker-context', script: join(HERE, 'docker-context.mjs') },
];

function main() {
  const failed = [];
  for (const check of CHECKS) {
    const res = spawnSync(process.execPath, [check.script], { cwd: ROOT, encoding: 'utf8' });
    const out = `${res.stdout ?? ''}${res.stderr ?? ''}`.trim();
    if (res.status === 0) {
      console.log(`✓ ${check.name}: ${out.split('\n')[0] ?? 'OK'}`);
    } else {
      failed.push(check.name);
      console.error(`\n✗ ${check.name} (exit ${res.status}):\n${out}`);
    }
  }
  console.log('');
  if (failed.length) {
    console.error(`check:all — FAIL (${failed.length}/${CHECKS.length}): ${failed.join(', ')}`);
    process.exit(1);
  }
  console.log(`check:all — OK (${CHECKS.length}/${CHECKS.length})`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
