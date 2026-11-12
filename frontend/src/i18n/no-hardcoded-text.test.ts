import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * FE-03b: štiti migraciju javnih stranica na i18n. Sve što posjetilac vidi na
 * `pages/public/**` i `pages/home/**` mora ići kroz `t('…')`, inače EN korisnik
 * dobija BS tekst (nalaz B-FE03-03).
 *
 * Provjera je namjerno konzervativna (samo JSX tekst i tekstualni propovi sa
 * literalnim stringom) da ne pravi lažne nalaze; allowlista pokriva tehničke
 * vrijednosti koje nisu UI tekst.
 */
const ROOTS = ['src/pages/public', 'src/pages/home'];

const TEXT_PROPS =
  /\b(title|subtitle|eyebrow|message|label|placeholder|alt|description|heading|caption|aria-label|emptyText|ctaText)\s*=\s*"([^"]{2,})"/g;
const JSX_TEXT = />\s*([A-Za-zÀ-ž0-9][^<>{}]{2,})\s*</g;

const SKIP_PREFIXES = ['import', '//', '*', '/*', 'export type', 'type '];

/** Dozvoljeni literali: brendovi, formati i simboli bez prevoda. */
const ALLOWED = [/^FK Gračanica$/, /^YouTube$/, /^Newsletter$/, /^Monri$/, /^[A-Z]{1,3}$/];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return files(full);
    return full.endsWith('.tsx') && !full.includes('.test.') ? [full] : [];
  });
}

function offenders(): string[] {
  const found: string[] = [];
  for (const root of ROOTS) {
    for (const file of files(resolve(process.cwd(), root))) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (SKIP_PREFIXES.some((prefix) => trimmed.startsWith(prefix)) || line.includes('t('))
          return;
        const values = [
          ...Array.from(line.matchAll(TEXT_PROPS), (m) => m[2]),
          ...Array.from(line.matchAll(JSX_TEXT), (m) => m[1]),
        ];
        for (const value of values) {
          const text = value.trim();
          if (!/[A-Za-zÀ-ž]{3,}/.test(text)) continue;
          if (ALLOWED.some((re) => re.test(text))) continue;
          found.push(`${relative(process.cwd(), file)}:${index + 1} → "${text}"`);
        }
      });
    }
  }
  return found;
}

describe('i18n na javnim stranicama (FE-03b)', () => {
  it('nema hardkodiranog UI teksta u pages/public i pages/home', () => {
    expect(offenders()).toEqual([]);
  });
});
