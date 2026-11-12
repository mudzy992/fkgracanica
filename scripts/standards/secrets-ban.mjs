#!/usr/bin/env node
/**
 * secrets-ban — regex provjera tajni u TRACKED fajlovima (F-001 se ne smije ponoviti).
 *
 * Eksplicitni izuzeci (allowlist, svaki s razlogom):
 *   AUDIT/**         — nalazi dokumentuju F-001 kao dokaz (ne dirati)
 *   docs/_retired/** — penzionisani dokumenti s F-001 dokazom (baner + INDEX)
 *   package-lock.json — sadrži integrity hashove (nije tajna)
 *
 * INF-02 (D-004): `.env*` allowlist UKLONJEN — `.env.example` je očišćen
 * (placeholder umjesto lažne F-001 lozinke); `.env` smije biti trackan samo
 * ako je čist (a u praksi NIJE trackan — vidi git ls-files).
 *
 * Sve ostalo: bilo koji novi pogodak = GREŠKA (exit 1).
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const ALLOW = [
  { re: /^AUDIT\//, reason: 'audit nalazi dokumentuju F-001 kao dokaz' },
  { re: /^docs\/DECISIONS\.md$/, reason: 'D-004 citira F-001 string kao dokaz da NIJE stvarna lozinka (dokument odluke)' },
  { re: /^docs\/_retired\//, reason: 'penzionisani dokumenti — F-001 dokaz pod banerom' },
  { re: /^backend\/test\//, reason: 'e2e fixture kredencijali — bacaju se s test bazom, nisu produkcioni' },
  { re: /^package-lock\.json$/, reason: 'integrity hashovi npm paketa (nisu tajne)' },
];

const BINARY_RE = /\.(png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf|eot|zip|gz|pdf|prisma-engine)$/i;
const TEXT_RE = /\.(ts|tsx|js|jsx|mjs|cjs|sh|yml|yaml|json|md|txt|env|example|toml|sql|prisma|css|html|Dockerfile)$/i;

/** [RegExp, opis] — inline (?i) ne postoji u JS-u → flag 'i' na objektu. Placeholder vrijednosti ne gadjaju. */
const PATTERNS = [
  [new RegExp('Mojalozin' + 'ka', 'gi'), 'F-001 poznata lozinka (mora ostati samo u allowlist dokumentima)'],
  [/-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, 'privatni ključ u repu'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key ID'],
  [/\bghp_[A-Za-z0-9]{36}\b/, 'GitHub personal access token'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, 'Slack token'],
  [/\bsk-[A-Za-z0-9]{20,}\b/, 'API key (sk-…)'],
  [
    /\b(password|passwd|pwd|secret|token|api[_-]?key)\b\s*[:=]\s*["']([^"'${}<>\s]{8,})["']/i,
    'literalna vrijednost tajne u kodu (koristi env varijablu)',
  ],
  [
    /\b(postgres|postgresql|mysql|redis|rediss|mongodb|amqp):\/\/[^\s:/@'"]+:[^\s@'"@]{6,}@/i,
    'connection string s ugrađenom lozinkom (koristi ${VAR} ili env)',
  ],
];

const PLACEHOLDER_RE = /(change[-_]?me|example|placeholder|dummy|your[-_]|xxx|\*\*\*|password|passwd|secret123|test123|demo)/i;

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
    .split('\0').filter(Boolean);
}

function run() {
  const errors = [];
  for (const file of trackedFiles()) {
    const allowed = ALLOW.find((a) => a.re.test(file));
    if (allowed) continue;
    if (BINARY_RE.test(file)) continue;
    if (!TEXT_RE.test(file) && !file.includes('Dockerfile') && !file.startsWith('.githooks/')) continue;
    let text;
    try {
      text = readFileSync(join(ROOT, file), 'utf8');
    } catch {
      continue;
    }
    if (text.includes('\0')) continue; // binarna
    const lines = text.split('\n');
    for (const [re, what] of PATTERNS) {
      const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        let m;
        while ((m = global.exec(line)) !== null) {
          const value = m[2] ?? m[0];
          if (PLACEHOLDER_RE.test(value)) continue;
          errors.push({
            rule: 'secrets-ban',
            where: `${file}:${li + 1}: "${line.trim().slice(0, 80)}"`,
            why: what,
            how: 'ukloni tajnu iz fajla → premjesti u .env (koji NIJE trackan); ako je već trackana, prijavi je odmah (F-001 klasa) i kreni rotaciju — NE samo brisanje',
          });
          break; // jedna greška po liniji po patternu
        }
      }
    }
  }
  return errors;
}

function report(errors) {
  if (!errors.length) {
    console.log('secrets-ban: OK (nema tajni u trackanim fajlovima; F-001 dokaz samo u allowlist dokumentima — AUDIT/DECISIONS/_retired)');
    return 0;
  }
  for (const e of errors) console.error(`  [${e.rule}] GDJE: ${e.where}\n           ZAŠTO: ${e.why}\n           KAKO:  ${e.how}\n`);
  return 1;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(report(run()));
export { run, report };
