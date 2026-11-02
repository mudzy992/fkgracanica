#!/usr/bin/env node
/**
 * docs-links — relativni linkovi u README.md i md fajlovima u docs/ MORAJU voditi na
 * postojeći fajl (klasa greške F-001: mrtvi linkovi). Vanjski (http/https,
 * mailto) i anchor-only (#…) linkovi se ne provjeravaju.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LINK_RE = /\]\(([^)\s]+)\)/g;

function mdFiles() {
  const all = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  return all.filter((f) => (f === 'README.md' || f.startsWith('docs/')) && f.endsWith('.md'));
}

function run() {
  const errors = [];
  for (const file of mdFiles()) {
    let text;
    try {
      text = readFileSync(join(ROOT, file), 'utf8');
    } catch {
      continue;
    }
    text.split('\n').forEach((line, i) => {
      let m;
      LINK_RE.lastIndex = 0;
      while ((m = LINK_RE.exec(line)) !== null) {
        let target = m[1];
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        target = target.split('#')[0];
        if (!target) continue;
        const abs = target.startsWith('/')
          ? join(ROOT, target)
          : resolve(dirname(join(ROOT, file)), target);
        if (!existsSync(abs)) {
          errors.push({
            rule: 'docs-links',
            where: `${file}:${i + 1} → ${m[1]}`,
            why: `link ne postoji: ${relative(ROOT, abs) || target}`,
            how: 'ispravi putanju ili ukloni link; mrtvi linkovi su zabranjeni (F-001 klasa)',
          });
        }
      }
    });
  }
  return errors;
}

function report(errors) {
  if (!errors.length) {
    console.log('docs-links: OK (svi relativni linkovi u docs/ i README vode na postojeće fajlove)');
    return 0;
  }
  for (const e of errors) console.error(`  [${e.rule}] GDJE: ${e.where}\n           ZAŠTO: ${e.why}\n           KAKO:  ${e.how}\n`);
  return 1;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(report(run()));
export { run, report };
