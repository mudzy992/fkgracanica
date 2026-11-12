#!/usr/bin/env node
/**
 * console-ban — zabrana console.log/debug/info u izvornom kodu
 * (izuzeci: logging sloj, scripts/). console.error/warn su dozvoljeni.
 * Razlog: debug ostaci u produkciji; trenutno stanje u repo-u je 0 (čisto).
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC_PREFIXES = ['backend/src/', 'backend/test/', 'frontend/src/', 'mobile/src/', 'mobile/app/'];
const ALLOW_RE = /(^|\/)(logger|logging)(\.|\/)/;
const BAN_RE = /console\.(log|debug|info)\s*\(/;

function trackedFiles() {
  return execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
}

function run() {
  const errors = [];
  for (const file of trackedFiles()) {
    if (!SRC_PREFIXES.some((p) => file.startsWith(p))) continue;
    if (ALLOW_RE.test(file)) continue;
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) continue;
    let text;
    try {
      text = readFileSync(join(ROOT, file), 'utf8');
    } catch {
      continue;
    }
    text.split('\n').forEach((line, i) => {
      if (BAN_RE.test(line)) {
        errors.push({
          rule: 'console-ban',
          where: `${file}:${i + 1}`,
          why: 'console.log/debug/info u src — debug ostatak u produkciji (zabranjeno pravilom)',
          how: 'ukloni ili prebaci na zvanični logger (Nest Logger); ako je izuzetak, evidentiraj u segmentu',
        });
      }
    });
  }
  return errors;
}

function report(errors) {
  if (!errors.length) {
    console.log('console-ban: OK (0 zabranjenih poziva u src)');
    return 0;
  }
  for (const e of errors) console.error(`  [${e.rule}] GDJE: ${e.where}\n           ZAŠTO: ${e.why}\n           KAKO:  ${e.how}\n`);
  return 1;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(report(run()));
export { run, report };
