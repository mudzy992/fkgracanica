import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * FE-04c — i18n admina, kao **ratchet** (ne „sve ili ništa").
 *
 * Admin ima ~500 hardkodiranih BS stringova u ~130 fajlova; migracija ide u
 * batch-evima. Ovaj test:
 *   1. pada ako se u nekom fajlu pojavi **više** nalaza nego u baseline-u,
 *   2. pada za **nov** fajl sa hardkodiranim tekstom,
 *   3. dozvoljava manje nalaza (migracija napreduje) i podsjeća da se baseline
 *      spusti: `UPDATE_I18N_BASELINE=1 npx vitest run src/i18n/admin-no-hardcoded-text.test.ts`
 *
 * Heuristika je ista kao za javne stranice (FE-03b): samo JSX tekst i tekstualni
 * propovi sa literalom — namjerno konzervativno, bez lažnih nalaza.
 */
const ROOTS = [
  'src/pages/admin',
  'src/components/admin',
  'src/components/common',
  'src/components/layout',
];

const BASELINE_FILE = resolve(process.cwd(), 'src/i18n/admin-i18n-baseline.json');

const TEXT_PROPS =
  /\b(title|subtitle|eyebrow|message|label|placeholder|alt|description|heading|caption|aria-label|emptyText|ctaText)\s*=\s*"([^"]{2,})"/g;
const JSX_TEXT = />\s*([A-Za-zÀ-ž0-9][^<>{}]{2,})\s*</g;

const SKIP_PREFIXES = ['import', '//', '*', '/*', 'export type', 'type '];

/** Tehničke vrijednosti koje nisu UI tekst. */
const ALLOWED = [
  /^FK Gračanica$/,
  /^YouTube$/,
  /^Newsletter$/,
  /^Monri$/,
  /^[A-Z]{1,3}$/,
  // URL-ovi i slug/HTML primjeri u `placeholder`-ima ne prevode se.
  /^https?:\/\//,
  /^url-slug$/,
  /^<div>\.\.\.<\/div>$/,
];

/**
 * TS deklaracije (`onConfirm: () => Promise<void>;`, `const x = (...) =>`) nisu UI
 * tekst — u JSX-u tekst nikad ne završava sa `;`, `{` ili `=>`.
 */
const TS_DECL = /(=>|;|\{)\s*$/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return files(full);
    return full.endsWith('.tsx') && !full.includes('.test.') ? [full] : [];
  });
}

export function countOffenders(file: string): number {
  const lines = readFileSync(file, 'utf8').split('\n');
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (SKIP_PREFIXES.some((prefix) => trimmed.startsWith(prefix)) || line.includes('t(')) continue;
    if (TS_DECL.test(trimmed) && !trimmed.includes('="')) continue;
    const values = [
      ...Array.from(line.matchAll(TEXT_PROPS), (m) => m[2]),
      ...Array.from(line.matchAll(JSX_TEXT), (m) => m[1]),
    ];
    for (const value of values) {
      const text = value.trim();
      if (!/[A-Za-zÀ-ž]{3,}/.test(text)) continue;
      if (ALLOWED.some((re) => re.test(text))) continue;
      count += 1;
    }
  }
  return count;
}

function scan(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const root of ROOTS) {
    for (const file of files(resolve(process.cwd(), root))) {
      const count = countOffenders(file);
      if (count > 0) out[relative(process.cwd(), file)] = count;
    }
  }
  return out;
}

const current = scan();
const baseline: Record<string, number> = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
const total = Object.values(current).reduce((a, b) => a + b, 0);
const totalBaseline = Object.values(baseline).reduce((a, b) => a + b, 0);

describe('i18n admina (FE-04c, ratchet)', () => {
  it('nijedan fajl nema više hardkodiranog teksta nego u baseline-u', () => {
    const worse = Object.entries(current)
      .filter(([file, count]) => count > (baseline[file] ?? 0))
      .map(([file, count]) => `${file}: ${count} (baseline ${baseline[file] ?? 0})`);
    expect(worse, `novi hardkodirani tekst:\n${worse.join('\n')}`).toEqual([]);
  });

  it('baseline se samo spušta (migracija napreduje)', () => {
    // Ako je `total` manji od baseline-a, migracija je napredovala: spusti baseline
    // sa UPDATE_I18N_BASELINE=1 (poruka ide kroz assertion message, ne u konzolu —
    // console-ban zabranjuje console.info u src).
    expect(
      total,
      `FE-04c: ${totalBaseline - total} stringova manje od baseline-a — osvježi baseline`,
    ).toBeLessThanOrEqual(totalBaseline);
  });
});

// generator baseline-a (pokreće se ručno, kao jedina „izmjena" baseline-a)
if (process.env.UPDATE_I18N_BASELINE === '1') {
  writeFileSync(BASELINE_FILE, `${JSON.stringify(current, null, 2)}\n`);
}
