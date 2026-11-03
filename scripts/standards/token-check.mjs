#!/usr/bin/env node
/**
 * token-check — CLI za pravila iz `token-rules.mjs` (segment FE-01).
 *
 *   node scripts/standards/token-check.mjs
 *
 * Izlaz: GDJE / ZAŠTO / KAKO po odstupanju; exit 1 ako padne neka od tvrdih provjera.
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './token-rules.mjs';

function report({ errors, warnings, paletteTotal, baseline }) {
  for (const w of warnings) console.log(`  [token-check] napomena: ${w}`);
  if (!errors.length) {
    console.log(
      `token-check: OK (palette ${paletteTotal}${baseline === null ? '' : `/${baseline}`}; tokeni definisani samo u index.css)`,
    );
    return 0;
  }
  for (const e of errors) {
    console.error(`  [${e.rule}] GDJE: ${e.where}\n           ZAŠTO: ${e.why}\n           KAKO:  ${e.how}\n`);
  }
  return 1;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(report(run()));
