/** token-rules — pravila za `token-check` (FE-01); CLI je u `token-check.mjs`.
 * 1. undefined-var   — svaki `var(--x)` u `frontend/src/**` definisan u `index.css`
 * 2. hex-utility     — nema `bg-[#123456]` i sl. van allowliste
 * 3. hex-literal     — nema golog `#hex` u kodu/CSS-u (osim fallbacka `var(--t, #hex)` i maski)
 * 4. theme-source    — `:root` ne redefiniše `--color-*` (osim `--color-*-rgb`); boje samo u `@theme`
 * 5. palette-ratchet — broj sirovih palette klasa (`bg-slate-900`…) ≤ baseline
 * 6. dark-variant    — `dark:` klase traže `@custom-variant dark` (app je dark-only)
 *
 * Detaljno obrazloženje: `AUDIT/segments/FE-01.md`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanFiles } from '../audit/inventory.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const THEME_FILE = 'frontend/src/index.css';
const BASELINE = join(HERE, 'baselines', 'token-palette.txt');
const SRC_PREFIX = 'frontend/src/';

/** Allowlist: fajlovi kojima je hardkodirana boja legitiman dio formata. */
const HEX_ALLOW = [
  {
    re: /^frontend\/src\/lib\/(membership-card-document|ticket-pass-document|season-pass-document|pass-print|pass-qr)\.ts$/,
    reason: 'print/PDF i QR dokumenti — standalone HTML bez pristupa CSS varijablama',
  },
  {
    re: /^frontend\/src\/components\/membership\/MembershipQrCode\.tsx$/,
    reason: 'QR kod mora imati čist crni/bijeli kontrast (skener)',
  },
  {
    re: /^frontend\/src\/pages\/showcase\//,
    reason: 'showcase mock ekrani — namjerno ”screenshot” boje van dizajn sistema',
  },
];

const COLOR_UTIL_HEX =
  /\b(?:bg|text|border|ring|ring-offset|from|via|to|fill|stroke|divide|placeholder|decoration|outline|shadow|accent|caret)-\[#[0-9a-fA-F]{3,8}\]/g;
const PALETTE =
  /\b(?:bg|text|border|ring|ring-offset|from|via|to|fill|stroke|divide|placeholder|decoration|outline|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b/g;

const isSource = (file) => file.startsWith(SRC_PREFIX);
const isCode = (file) => /\.(ts|tsx)$/.test(file);
const isCss = (file) => file.endsWith('.css');
const allowed = (file) => HEX_ALLOW.find((a) => a.re.test(file));

function block(css, header) {
  const start = css.indexOf(header);
  if (start === -1) return '';
  const from = start + header.length;
  let depth = 1;
  let i = from;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') depth -= 1;
    i += 1;
  }
  return css.slice(from, i - 1);
}

function parseVars(cssBlock) {
  const vars = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(cssBlock)) !== null) vars.set(m[1], m[2].trim());
  return vars;
}

function readBaseline() {
  if (!existsSync(BASELINE)) return null;
  const raw = readFileSync(BASELINE, 'utf8').split('\n').find((l) => l.trim() && !l.trim().startsWith('#'));
  const n = Number.parseInt((raw ?? '').trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function countPalette(text) {
  return (text.match(PALETTE) ?? []).length;
}

function run() {
  const errors = [];
  const warnings = [];
  const files = scanFiles().filter((f) => isSource(f.file));

  const themeCss = existsSync(join(ROOT, THEME_FILE)) ? readFileSync(join(ROOT, THEME_FILE), 'utf8') : '';
  const themeVars = parseVars(block(themeCss, '@theme {'));
  const rootVars = parseVars(block(themeCss, ':root {'));
  const defined = new Set([...themeVars.keys(), ...rootVars.keys()]);
  const hasCustomDark = /@custom-variant\s+dark/.test(themeCss);

  let paletteTotal = 0;
  let darkUsages = 0;

  for (const { file } of files) {
    // komentari ne smiju proizvesti nalaz — zamijeni ih prazninama (linije ostaju)
    const raw = readFileSync(join(ROOT, file), 'utf8');
    const text = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    const lines = text.split('\n');
    const isComment = (line) => /^\s*(\/\/|\*|\/\*)/.test(line);
    const allow = allowed(file);

    lines.forEach((line, index) => {
      const where = `${file}:${index + 1}`;
      if (isComment(line)) return;

      // 1. nedefinisane CSS varijable
      for (const m of line.matchAll(/var\((--[a-z0-9-]+)/gi)) {
        const name = m[1];
        if (name.startsWith('--tw-') || defined.has(name)) continue;
        errors.push({
          rule: 'token-check/undefined-var',
          where: `${where} (${name})`,
          why: 'varijabla se koristi ali nije definisana u frontend/src/index.css',
          how: `dodaj \`${name}\` u @theme (ako je boja/token) ili u :root (ako je runtime vrijednost)`,
        });
      }

      // 2. proizvoljna hex boja u utility klasi
      if (isCode(file) && !allow) {
        const hits = line.match(COLOR_UTIL_HEX);
        if (hits) {
          errors.push({
            rule: 'token-check/hex-utility',
            where: `${where} (${hits[0]})`,
            why: 'proizvoljna boja u utility klasi zaobilazi design tokene',
            how: 'koristi token (npr. bg-surface, text-primary-light) ili dodaj token u index.css @theme',
          });
        }
      }

      // 3. goli hex literal
      if (!allow) {
        const stripped = line.replace(/\[[^\]]*\]/g, '[]'); // arbitrary vrijednosti pokriva pravilo 2
        const bare = stripped.match(/#[0-9a-fA-F]{3,8}\b/);
        if (bare) {
          const isFallback = /var\(--[a-z0-9-]+,\s*#[0-9a-fA-F]{3,8}/.test(line);
          const isMask = /mask/.test(line);
          const isThemeSource = file === THEME_FILE;
          if (isCode(file) || (!isCss(file) ? false : !isMask && !isFallback && !isThemeSource)) {
            errors.push({
              rule: 'token-check/hex-literal',
              where: `${where} (${bare[0]})`,
              why: isCode(file)
                ? 'hardkodirana boja u kodu — paleta se ne može mijenjati na jednom mjestu'
                : 'hex u CSS-u van index.css — token mora doći iz @theme/:root',
              how: 'koristi CSS varijablu/token; ako je boja propisana formatom (print, QR, vendor) dodaj fajl u HEX_ALLOW',
            });
          }
        }
      }

      // 5/6. ratchet + dark varijanta
      paletteTotal += countPalette(line);
      darkUsages += (line.match(/\bdark:/g) ?? []).length;
    });
  }

  // 4. boje samo u @theme
  for (const name of rootVars.keys()) {
    if (!name.startsWith('--color-') || /-rgb$/.test(name)) continue;
    errors.push({
      rule: 'token-check/theme-source',
      where: `${THEME_FILE} :root (${name})`,
      why: 'boja je definisana u :root umjesto u @theme — dva izvora istine',
      how: 'premjesti u @theme (Tailwind generiše CSS varijablu i utility klase); -rgb companions ostaju u :root',
    });
  }

  // 5. ratchet sirove palete
  const baseline = readBaseline();
  if (baseline !== null && paletteTotal > baseline) {
    errors.push({
      rule: 'token-check/palette-ratchet',
      where: `${paletteTotal} sirovih palette klasa (baseline ${baseline})`,
      why: 'broj boja van dizajn sistema je porastao',
      how: 'koristi tokene (bg-surface, text-text-muted, border-subtle…); baseline smije samo padati',
    });
  } else if (baseline !== null && paletteTotal < baseline) {
    warnings.push(
      `palette-ratchet: ${paletteTotal} < baseline ${baseline} — snizi baseline u baselines/token-palette.txt`,
    );
  }

  // 6. dark varijanta — aplikacija je dark-only, `dark:` mora pratiti `.dark` klasu
  if (darkUsages > 0 && !hasCustomDark) {
    errors.push({
      rule: 'token-check/dark-variant',
      where: `${darkUsages} \`dark:\` klasa u frontend/src`,
      why: 'bez `@custom-variant dark` Tailwind veže `dark:` na `prefers-color-scheme`, a app je dark-only',
      how: 'dodaj `@custom-variant dark (&:where(.dark, .dark *));` u frontend/src/index.css',
    });
  }

  return { errors, warnings, paletteTotal, baseline };
}

export { run };
