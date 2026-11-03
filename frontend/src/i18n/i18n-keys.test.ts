import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import bs from "../locales/bs/common.json";
import en from "../locales/en/common.json";

type Dict = { [key: string]: string | Dict };

function flatten(dict: Dict, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(dict)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[path] = value;
    else Object.assign(out, flatten(value, path));
  }
  return out;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(full) && !/\.(test|spec)\.(ts|tsx)$/.test(full)
      ? [full]
      : [];
  });
}

const BS = flatten(bs as Dict);
const EN = flatten(en as Dict);

/** `t('key')` / `t("key")` — preskače template literale sa interpolacijom. */
function usedKeys(): Set<string> {
  const keys = new Set<string>();
  for (const file of sourceFiles(resolve(process.cwd(), "src"))) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) keys.add(m[1]);
  }
  return keys;
}

describe("i18n ključevi (FE-03)", () => {
  it("bs i en imaju isti skup ključeva", () => {
    expect(Object.keys(EN).sort()).toEqual(Object.keys(BS).sort());
  });

  it("nijedna vrijednost nije prazna", () => {
    for (const [key, value] of Object.entries({ ...BS, ...EN })) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  it("svaki literalni t() ključ postoji u bs i en", () => {
    const missing = [...usedKeys()]
      .filter((k) => !(k in BS) || !(k in EN))
      .sort();
    expect(missing).toEqual([]);
  });
});
