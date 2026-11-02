#!/usr/bin/env node
/**
 * CHECK-COVERAGE — audit gate (FAZA 3, pravilo 4 protokola).
 *
 *   node scripts/audit/check-coverage.mjs
 *
 * Pravila (svako odstupanje: KOJE pravilo, GDJE, ZAŠTO, KAKO popraviti; exit 1):
 *  R1  svaki izvorni fajl iz skena MORA postojati u AUDIT/COVERAGE_MATRIX.csv
 *  R2  svaki red u matrici MORA odgovarati fajlu koji postoji na disku
 *  R3  segment označen `Status segmenta: ZATVOREN` u AUDIT/segments/*.md
 *      smije imati SAMO fajlove sa statusom pregledano/popravljeno/pokriveno testom
 *  R4  status mora biti iz dozvoljenog skupa; dupli redovi zabranjeni
 *
 * Pokreće se lokalno (pre-push hook) i u CI-ju kao audit-gate job.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { scanFiles, MATRIX, COLUMNS, STATUSES, parseCsv, ROOT } from './inventory.mjs';

const OK_STATUSES = new Set(['pregledano', 'popravljeno', 'pokriveno testom']);
const SEGMENTS_DIR = join(ROOT, 'AUDIT', 'segments');
const CLOSED_RE = /^Status segmenta:\s*ZATVOREN\s*$/m;

const errors = [];
const fail = (rule, where, why, how) => errors.push({ rule, where, why, how });

function main() {
  if (!existsSync(MATRIX)) {
    fail('R0', 'AUDIT/COVERAGE_MATRIX.csv', 'matrica ne postoji — inventar nikad nije napravljen',
      'pokreni `node scripts/audit/inventory.mjs` i commitaj matricu');
    return report();
  }

  const rows = parseCsv(readFileSync(MATRIX, 'utf8'));
  const header = rows[0];
  if (!header || header.length !== COLUMNS.length) {
    fail('R0', 'AUDIT/COVERAGE_MATRIX.csv', `neispravan header (očekivano: ${COLUMNS.join(',')})`,
      'pokreni `node scripts/audit/inventory.mjs` da regeneriše matricu');
    return report();
  }

  const seen = new Set();
  const bySegment = new Map(); // segment -> [{file,status}]
  for (const r of rows.slice(1)) {
    const [file, layer, module, loc, status, findings, segment, date] = r;
    if (!file) continue;
    if (seen.has(file)) {
      fail('R4', `matrica: dupli red "${file}"`, 'dupliran red razbija evidenciju pokrivenosti',
        'obriši jedan od redova (pokreni inventory da očisti)');
    }
    seen.add(file);
    if (!STATUSES.includes(status ?? '')) {
      fail('R4', `matrica: "${file}" → status="${status}"`,
        `status mora biti jedan od: ${STATUSES.join(' / ')}`,
        'ispravi status u AUDIT/COVERAGE_MATRIX.csv');
    }
    if (segment) {
      if (!bySegment.has(segment)) bySegment.set(segment, []);
      bySegment.get(segment).push({ file, status });
    }
    void layer; void module; void loc; void findings; void date;
  }

  // R1 — fajl postoji u kodu, nije u matrici
  const scanned = scanFiles();
  for (const f of scanned) {
    if (!seen.has(f.file)) {
      fail('R1', f.file, 'izvorni fajl nije u matrici — dokaz o pokrivenosti nepotpun (pravilo 4)',
        'pokreni `node scripts/audit/inventory.mjs`, popuni red, commitaj');
    }
  }

  // R2 — red u matrici, fajl ne postoji
  for (const file of seen) {
    if (!scanned.some((f) => f.file === file)) {
      fail('R2', file, 'matrica referencira fajl koji ne postoji (zastarjeli red)',
        'pokreni `node scripts/audit/inventory.mjs` — uklanja nestale fajlove');
    }
  }

  // R3 — zatvoreni segment
  if (existsSync(SEGMENTS_DIR)) {
    for (const name of readdirSync(SEGMENTS_DIR)) {
      if (!name.endsWith('.md')) continue;
      const text = readFileSync(join(SEGMENTS_DIR, name), 'utf8');
      if (!CLOSED_RE.test(text)) continue;
      const segId = name.replace(/\.md$/, '');
      const files = bySegment.get(segId) ?? [];
      if (files.length === 0) {
        fail('R3', `AUDIT/segments/${name}`, 'segment je ZATVOREN ali nema nijedan fajl dodijeljen u matrici',
          'dodijeli fajlove segmentu u matrici (kolona "segment") pa ih označi pregledanim prije zatvaranja');
        continue;
      }
      for (const { file, status } of files) {
        if (!OK_STATUSES.has(status)) {
          fail('R3', `${file} (segment ${segId})`,
            `segment je ZATVOREN, ali fajl ima status "${status}" (dozvoljeno: ${[...OK_STATUSES].join(', ')})`,
            'dovrši pregled/popravku fajla i ažuriraj status u matrici prije zatvaranja segmenta');
        }
      }
    }
  }

  report();
}

function report() {
  if (errors.length === 0) {
    console.log('check-coverage: OK — matrica pokriva sve izvorne fajlove; nema zatvorenih segmenta s nepregledanim fajlovima.');
    process.exit(0);
  }
  console.error(`check-coverage: ${errors.length} odstupanje(a):\n`);
  for (const e of errors) {
    console.error(`  [${e.rule}] GDJE:   ${e.where}`);
    console.error(`           ZAŠTO:  ${e.why}`);
    console.error(`           KAKO:   ${e.how}\n`);
  }
  process.exit(1);
}

main();
