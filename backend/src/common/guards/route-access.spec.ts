import 'reflect-metadata';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { RequestMethod } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { APPROVED_PUBLIC } from './approved-public-routes';

/**
 * BE-02 / Q-12(a) — D-006: TESTOVI JAVNO-VS-ZAŠTIĆENO (statički, preko
 * STVARNIH Nest metapodataka dekoratora — ne preko regex heuristike).
 *
 * Nevezanost od baze: `@prisma/client` je mockovan da spec radi i lokalno
 * (klijent se generiše samo u CI-ju).
 *
 * Invarijante:
 *  1. Skup ruta s @Public (klasa ili metoda) = TAČNO odobrenih 71 ruta —
 *     niti jedna više (rupe u zaštiti), niti jedna manje (pao portal).
 *  2. Nijedan kontroler više nema lokalni JwtAuthGuard (jedina istina =
 *     globalna APP_GUARD registracija).
 *  3. app.module.ts registrira JwtAuthGuard kao APP_GUARD (throttler prvi).
 */
jest.mock('@prisma/client', () => {
  // Sentinel: dozvoljava bilo koji named export (enum-e poput MatchPeriod se
  // koriste na module-eval) — potrebna nam je SAMO eval-kompatibilnost da
  // pročitamo dekoratore; PrismaClient je prazna klasa (konstruktor se ne poziva).
  const makeSentinel = (): unknown => {
    const target: Record<string, unknown> = {};
    return new Proxy(target, {
      get: (t, prop) => {
        if (prop === 'PrismaClient') return class PrismaClientMock {};
        if (prop === 'then') return undefined; // ne smije biti thenable
        if (prop === 'toString') return () => '[prisma-mock]';
        if (prop === Symbol.toPrimitive) return () => '[prisma-mock]';
        if (typeof prop === 'symbol') return Reflect.get(t, prop) as unknown;
        if (!(prop in t)) t[prop] = makeSentinel();
        return t[prop];
      },
      has: () => true,
    });
  };
  return makeSentinel();
});

// Nest konstante (string literali — ne ovisimo o internom import pathu)
const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';

const VERBS: Record<number, string> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
  [RequestMethod.PUT]: 'PUT',
  [RequestMethod.DELETE]: 'DELETE',
  [RequestMethod.PATCH]: 'PATCH',
  [RequestMethod.OPTIONS]: 'OPTIONS',
  [RequestMethod.HEAD]: 'HEAD',
};

type ControllerClass = { name: string; prototype: Record<string, unknown> };

function isControllerExport(v: unknown): v is ControllerClass {
  return (
    typeof v === 'function' &&
    /\w+Controller$/.test((v as ControllerClass).name)
  );
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.controller.ts')) out.push(p);
  }
  return out;
}

function joinPath(...parts: string[]): string {
  const joined = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
  return '/' + joined;
}

describe('BE-02 route access (javno vs zaštićeno)', () => {
  let publicRoutes: string[];
  let controllerFiles: string[];

  beforeAll(() => {
    const SRC = join(__dirname, '..', '..');
    controllerFiles = walk(SRC).sort();
    publicRoutes = [];

    for (const file of controllerFiles) {
      // CJS dynamic load: import() u ts-jest/CJS zahtijeva --experimental-vm-modules
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require(file) as Record<string, unknown>;
      for (const value of Object.values(mod)) {
        if (!isControllerExport(value)) continue;
        const cls = value;
        const rawClassPath = Reflect.getMetadata(PATH_METADATA, cls) as unknown;
        const classPath = typeof rawClassPath === 'string' ? rawClassPath : '';
        const classPublic = Reflect.getMetadata(IS_PUBLIC_KEY, cls) === true;

        for (const desc of Object.values(
          Object.getOwnPropertyDescriptors(cls.prototype),
        )) {
          if (typeof desc.value !== 'function') continue;
          const fn: unknown = desc.value;
          const method = Reflect.getMetadata(METHOD_METADATA, fn) as
            number | undefined;
          if (method === undefined) continue; // nije ruta
          const rawPath = Reflect.getMetadata(PATH_METADATA, fn) as unknown;
          const methodPath = typeof rawPath === 'string' ? rawPath : '';
          const verb = VERBS[method] ?? 'OTHER';
          const path = joinPath('api/v1', classPath, methodPath);
          const isPublic =
            classPublic || Reflect.getMetadata(IS_PUBLIC_KEY, fn) === true;
          if (isPublic) publicRoutes.push(verb + ' ' + path);
        }
      }
    }
    publicRoutes = [...new Set(publicRoutes)].sort();
  });

  it('javne rute = tačno odobrenih 71 (bez rupa i bez viška)', () => {
    const approved = [...APPROVED_PUBLIC].sort();
    const missing = approved.filter((r) => !publicRoutes.includes(r));
    const extra = publicRoutes.filter((r) => !approved.includes(r));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    expect(publicRoutes.length).toBe(71);
  });

  it('nijedan kontroler nema više lokalni JwtAuthGuard (globalni je jedina istina)', () => {
    const offenders = controllerFiles.filter((f) =>
      readFileSync(f, 'utf8').includes('JwtAuthGuard'),
    );
    expect(offenders).toEqual([]);
  });

  it('app.module registrira JwtAuthGuard kao APP_GUARD (throttler prvi)', () => {
    const src = readFileSync(
      join(__dirname, '..', '..', 'app.module.ts'),
      'utf8',
    );
    expect(src).toContain('provide: APP_GUARD, useClass: ThrottlerGuard');
    expect(src).toContain('provide: APP_GUARD, useClass: JwtAuthGuard');
    const ti = src.indexOf('useClass: ThrottlerGuard');
    const ai = src.indexOf('useClass: JwtAuthGuard');
    expect(ti).toBeGreaterThanOrEqual(0);
    expect(ai).toBeGreaterThan(ti);
  });

  it('regresija: health i login su u javnom skupu', () => {
    expect(publicRoutes).toContain('GET /api/v1/health');
    expect(publicRoutes).toContain('POST /api/v1/auth/login');
  });
});
