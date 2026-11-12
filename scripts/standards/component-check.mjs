#!/usr/bin/env node
/**
 * component-check — guard za FE-01 kit konzistentnost (Button/Input/Textarea/Select/Table vs raw).
 *
 *   node scripts/standards/component-check.mjs
 *
 * Provjerava da u `frontend/src/pages/admin/**` nema raw HTML elemenata van kita.
 * Svi kit elementi (Button/Input/Textarea/Select/Table) moraju biti 100% kroz kit
 * (prag 0% raw, izuzetak samo hidden/file).
 *
 * Izuzeci (ne broje se kao hardcode):
 *   - `<input type="hidden"` — serijalizacija JSON-a
 *   - `<input type="file"` — file picker (namerno van Input varijante)
 *   - `phone-frame`, `hidden`, `sr-only` showcase/helpers
 * Za checkbox/radio koristi <Switch> — raw se broji kao greška (0% prag).
 *
 * Izlaz: OK ili FAIL sa lokacijama.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(join(new URL('.', import.meta.url).pathname, '../..'));
const ROOTS = ['frontend/src/pages/admin','frontend/src/components/admin']; // Val2 proširenje 2026-11-12: obuhvat 169+22 fajla (pages+components)
const THRESHOLD = 0; // strogo 0% — nakon migracije sve je kroz kit (Button/Input/Textarea/Select/Table), izuzetak samo hidden/file

function files(dir) {
  const full = join(ROOT, dir);
  let out = [];
  try {
    for (const entry of readdirSync(full)) {
      const p = join(full, entry);
      if (statSync(p).isDirectory()) out.push(...files(join(dir, entry)));
      else if (p.endsWith('.tsx') && !p.includes('.test.') && !p.includes('.spec.')) out.push(p);
    }
  } catch {}
  return out;
}

function countInFile(file) {
  const text = readFileSync(file, 'utf8');
  // Kit counts: <Button etc. (case-sensitive)
  const kitButton = (text.match(/<Button\b/g) || []).length;
  const kitInput = (text.match(/<Input\b/g) || []).length;
  const kitTextarea = (text.match(/<Textarea\b/g) || []).length;
  const kitSelect = (text.match(/<Select\b/g) || []).length;
  const kitTable = (text.match(/<Table\b/g) || []).length;

  // Raw counts: direct HTML tags (case-sensitive, exclude hidden/file)
  const rawButtonMatches = [...text.matchAll(/<button\b[^>]*>/g)];
  const rawButton = rawButtonMatches.filter(m => !m[0].includes('type="hidden"') && !m[0].includes("type='hidden'")).length;
  const rawInputMatches = [...text.matchAll(/<input\b[^>]*>/g)];
  const rawInput = rawInputMatches.filter(m => {
    const s = m[0].toLowerCase();
    return !s.includes('type="hidden"') && !s.includes("type='hidden'") && !s.includes('type="file"') && !s.includes("type='file'");
  }).length;
  const rawTextarea = (text.match(/<textarea\b/g) || []).length;
  const rawSelect = (text.match(/<select\b/g) || []).length;
  const rawTable = (text.match(/<table\b/g) || []).length;

  return { kitButton, kitInput, kitTextarea, kitSelect, kitTable, rawButton, rawInput, rawTextarea, rawSelect, rawTable };
}

function main() {
  const allFiles = ROOTS.flatMap(files);
  let totals = { kitButton:0, kitInput:0, kitTextarea:0, kitSelect:0, kitTable:0, rawButton:0, rawInput:0, rawTextarea:0, rawSelect:0, rawTable:0 };
  let offenders = [];
  for (const f of allFiles) {
    const c = countInFile(f);
    for (const k of Object.keys(totals)) totals[k] += c[k];
    if (c.rawButton>0 || c.rawInput>0 || c.rawTextarea>0 || c.rawSelect>0 || c.rawTable>0) {
      const rel = relative(ROOT, f);
      const details = [];
      if (c.rawButton) details.push(`<button> ${c.rawButton} (kit ${c.kitButton})`);
      if (c.rawInput) details.push(`<input> ${c.rawInput} (kit ${c.kitInput})`);
      if (c.rawTextarea) details.push(`<textarea> ${c.rawTextarea} (kit ${c.kitTextarea})`);
      if (c.rawSelect) details.push(`<select> ${c.rawSelect} (kit ${c.kitSelect})`);
      if (c.rawTable) details.push(`<table> ${c.rawTable} (kit ${c.kitTable})`);
      offenders.push(`${rel}: ${details.join(', ')}`);
    }
  }

  const checks = [
    { kit: totals.kitButton, raw: totals.rawButton, name: 'Button', threshold: THRESHOLD },
    { kit: totals.kitInput, raw: totals.rawInput, name: 'Input', threshold: THRESHOLD },
    { kit: totals.kitTextarea, raw: totals.rawTextarea, name: 'Textarea', threshold: 0 },
    { kit: totals.kitSelect, raw: totals.rawSelect, name: 'Select', threshold: 0 },
    { kit: totals.kitTable, raw: totals.rawTable, name: 'Table', threshold: 0 },
  ];

  let failed = [];
  for (const ch of checks) {
    const total = ch.kit + ch.raw;
    const ratio = total ? ch.raw/total : 0;
    const limit = ch.threshold;
    const pct = (ratio*100).toFixed(1);
    const status = ratio <= limit ? 'OK' : 'FAIL';
    console.log(`${ch.name}: kit ${ch.kit} vs raw ${ch.raw} → ${pct}% raw ${status} (limit ${(limit*100).toFixed(0)}%)`);
    if (ratio > limit) failed.push(`${ch.name} ${pct}% > ${(limit*100).toFixed(0)}% (raw ${ch.raw}, kit ${ch.kit})`);
  }

  if (offenders.length) {
    console.log('\nRaw lokacije (bez testova, bez hidden/file):');
    for (const o of offenders) console.log(`  ${o}`);
  }

  if (failed.length) {
    console.error(`\ncomponent-check: FAIL — ${failed.join('; ')}`);
    console.error('KAKO: migrirati raw <button>/<input>/<textarea>/<select>/<table> na <Button>/<Input>/<Textarea>/<Select>/<Table> iz components/ui');
    return 1;
  }
  console.log('\ncomponent-check: OK (kit konzistentnost u adminu)');
  return 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(main());
