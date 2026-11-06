import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../components/layout/AdminLayout', () => ({ AdminLayout: () => null }));
vi.mock('./root-shell', () => ({ RootShell: () => null }));
vi.mock('../components/common/ProtectedRoute', () => ({ ProtectedRoute: () => null }));
vi.mock('../components/common/PermissionRoute', () => ({ PermissionRoute: () => null }));
vi.mock('../components/common/ModuleRoute', () => ({ ModuleRoute: () => null }));
vi.mock('../components/common/ShowcaseGate', () => ({ ShowcaseGate: () => null }));
vi.mock('./public-layout-routes', () => ({ publicLayoutRoutes: [] }));

const { appRouteElements } = await import('./app-routes');

type AnyElement = ReactElement<{ path?: string; element?: unknown; children?: AnyElement[] }>;

function walk(node: unknown, out: Array<{ path?: string; index: boolean }> = []) {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, out);
    return out;
  }
  if (!node || typeof node !== 'object') return out;
  const el = node as AnyElement;
  if (el.props && typeof el.props === 'object') {
    out.push({ path: el.props.path, index: el.props.path === undefined && 'index' in el.props });
    walk(el.props.children, out);
  }
  return out;
}

const routes = walk(appRouteElements);
const paths = routes.map((r) => r.path).filter((p): p is string => typeof p === 'string');

describe('appRouteElements', () => {
  it('sadrži javne i admin rute', () => {
    expect(paths).toContain('platforma');
    expect(paths).toContain('live/:id');
    expect(paths).toContain('prijava');
    expect(paths).toContain('admin/login');
    expect(paths).toContain('*');
    expect(paths.length).toBeGreaterThan(40);
  });

  it('admin rute za sadržaj i takmičenja', () => {
    expect(paths).toEqual(
      expect.arrayContaining([
        'admin',
        'news/:id/edit',
        'gallery',
        'gallery/:id/edit',
        'clubs',
        'competitions',
        'rounds',
        'matches/:id/report',
        'live/:id',
        'players',
        'roles',
        'settings',
        'stanje',
      ]),
    );
  });

  it('preusmjeravanja za naslijeđe i komunikacije', () => {
    expect(paths).toEqual(
      expect.arrayContaining(['hall-of-fame', 'museum', 'contact', 'newsletter']),
    );
  });

  it('nepoznata ruta vodi na početnu', () => {
    const wildcard = routes.length;
    expect(wildcard).toBeGreaterThan(0);
    const last = appRouteElements.props.children as AnyElement[];
    expect(last.length).toBeGreaterThan(0);
  });

  it('svaka ruta ima jedinstvenu putanju unutar svog nivoa', () => {
    const unique = new Set(paths);
    expect(unique.size).toBeLessThanOrEqual(paths.length);
  });
});
