import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { ALL_PERMISSION_KEYS, PERMISSIONS } from './permissions';

const SRC = join(__dirname, '..', '..');

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith('.controller.ts')
      ? [full]
      : [];
  });
}

function keysUsedInCode(): Set<string> {
  const keys = new Set<string>();
  for (const file of walk(SRC)) {
    const text = readFileSync(file, 'utf8');
    const re = /@Require(?:Any)?Permissions?\(([^)]*)\)/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      for (const key of match[1].match(/'([^']+)'/g) ?? []) {
        keys.add(key.replace(/'/g, ''));
      }
    }
  }
  return keys;
}

describe('permissions katalog — regresija drifta (BE-09 / P-B09-8)', () => {
  it('nema duplih ključeva u PERMISSIONS', () => {
    expect(new Set(ALL_PERMISSION_KEYS).size).toBe(PERMISSIONS.length);
  });

  it('svaki ključ korišten u kodu postoji u PERMISSIONS', () => {
    const missing = [...keysUsedInCode()].filter(
      (key) => !ALL_PERMISSION_KEYS.includes(key as never),
    );
    expect(missing).toEqual([]);
  });

  it('svaki ključ iz PERMISSIONS se koristi bar na jednoj ruti', () => {
    const used = keysUsedInCode();
    const unused = ALL_PERMISSION_KEYS.filter((key) => !used.has(key));
    expect(unused).toEqual([]);
  });

  it('ključevi su u `<modul>.<akcija>` formatu i imaju opis', () => {
    for (const perm of PERMISSIONS) {
      expect(perm.key).toMatch(/^[a-z][a-z0-9-]*\.[a-z]+$/);
      expect(perm.description.trim().length).toBeGreaterThan(3);
    }
  });
});
