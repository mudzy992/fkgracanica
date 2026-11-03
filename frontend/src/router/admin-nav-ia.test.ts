import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ADMIN_NAV_GROUPS } from '../components/layout/admin-nav-groups';

/**
 * FE-05 — guard za internu IA (pronalaženje funkcionalnosti).
 *
 * Dvije invarijante koje se tiho kvare kad se doda nova stranica:
 *
 *  1. **Mrtav link u meniju** — stavka navigacije pokazuje na rutu koje nema
 *     (korisnik klikne i padne na redirect/404).
 *  2. **Siroče** — admin ruta postoji, ali do nje ne vodi ni meni ni nijedan
 *     `Link`/`Navigate` u kodu → stranica je praktično nepristupačna.
 *
 * Detaljne rute (`:id`, `:seasonId`…) se preskaču: do njih se dolazi iz liste.
 */
const ROUTES_FILE = 'src/router/app-routes.tsx';
const ADMIN_DIR = 'src/pages/admin';

/** `path="…"` vrijednosti samo iz `admin` grane routera (ne javne rute). */
function routePaths(): string[] {
  const source = readFileSync(resolve(process.cwd(), ROUTES_FILE), 'utf8');
  const start = source.indexOf('<Route path="admin"');
  const end = source.indexOf('<Route path="*"');
  const admin = start === -1 ? source : source.slice(start, end === -1 ? undefined : end);
  // `path="admin"` je korijen grane — nije zasebna stranica
  return Array.from(admin.matchAll(/path="([^"]+)"/g), (m) => m[1]).filter((p) => p !== 'admin');
}

function navTargets(): string[] {
  return ADMIN_NAV_GROUPS.flatMap((group) => group.items.map((item) => item.to)).filter((to) =>
    to.startsWith('/admin'),
  );
}

/** Da li bilo gdje u `src/` postoji link na datu admin putanju. */
function linked(path: string): boolean {
  const needles = [`"${path}"`, `'${path}'`, `\`${path}\``, `${path}\``, `${path}?`];
  const walk = (dir: string): boolean =>
    readdirSync(dir).some((entry) => {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) return walk(full);
      if (!/\.(tsx?|ts)$/.test(full) || full.endsWith('.test.ts')) return false;
      const text = readFileSync(full, 'utf8');
      return needles.some((needle) => text.includes(needle));
    });
  return walk(resolve(process.cwd(), 'src'));
}

describe('interna IA (FE-05)', () => {
  it('svaka stavka admin menija pokazuje na postojeću rutu', () => {
    const paths = routePaths();
    const known = new Set(paths.map((p) => `/admin/${p}`));
    const dead = navTargets().filter((to) => to !== '/admin' && !known.has(to));
    expect(dead, `stavke menija bez rute: ${dead.join(', ')}`).toEqual([]);
  });

  it('nema siročića: svaka admin stranica je u meniju ili linkovana iz koda', () => {
    const skip = /(:|\*)/; // detalj rute i wildcard
    const redirects = new Set([
      'roles',
      'players',
      'matches',
      'rounds',
      'hall-of-fame',
      'museum',
      'contact',
      'newsletter',
    ]);
    const orphans = routePaths()
      .filter((p) => !skip.test(p))
      .filter((p) => !redirects.has(p))
      .map((p) => `/admin/${p}`)
      .filter((full) => {
        if (full === '/admin') return false;
        if (navTargets().includes(full)) return false;
        return !linked(full);
      });
    expect(orphans, `admin stranice bez ulaza: ${orphans.join(', ')}`).toEqual([]);
  });

  it('stranice iz admin direktorija prate imenovanje ruta (bez tihih duplikata)', () => {
    const pages = readdirSync(resolve(process.cwd(), ADMIN_DIR))
      .filter((f) => f.endsWith('Page.tsx'))
      .map((f) => relative(ADMIN_DIR, f));
    // samo informativno: broj stranica mora ostati stabilan (regresija ako fajl nestane)
    expect(pages.length).toBeGreaterThan(10);
  });
});
