#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareBudget, measureBudget } from './bundle-budget-measure.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  if (index < 0) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Nedostaje vrijednost ${flag}`);
  return resolve(args[index + 1]);
};
try {
  const dist = value('--dist', join(root, 'frontend/dist'));
  const result = measureBudget(dist);
  console.log(JSON.stringify(result, null, 2));
  if (!args.includes('--report')) {
    const baselineFile = value('--baseline', join(root, 'scripts/standards/baselines/bundle-budget.json'));
    const config = JSON.parse(readFileSync(baselineFile, 'utf8'));
    if (config.version !== 1 || config.tolerancePercent !== 5) throw new Error('Neispravan format ili tolerancija baselina');
    const errors = compareBudget(result, config.baseline, config.tolerancePercent);
    if (errors.length) throw new Error(`Bundle budget prekoračen:\n${errors.join('\n')}`);
    console.log('bundle-budget: OK (svih 8 metrika ≤ baseline +5%)');
  }
} catch (error) {
  console.error(`bundle-budget: FAIL — ${error.message}`);
  process.exitCode = 1;
}
