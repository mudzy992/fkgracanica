import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminLayout } from './AdminLayout';

const state = vi.hoisted(() => ({
  publicSettings: {} as Record<string, unknown>,
  privateSettings: {} as Record<string, unknown>,
  visible: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: { firstName: 'A', lastName: 'B', permissions: [] }, logout: vi.fn() }),
}));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: state.publicSettings }),
  usePrivateSettings: () => ({ data: state.privateSettings }),
}));
vi.mock('../../lib/module-settings-rules', () => ({
  isModuleEnabled: (settings: Record<string, unknown>, key: string) => settings[key] !== false,
}));
vi.mock('../../lib/admin-module-map', () => ({
  resolveAdminModuleKey: (to: string) => (to.startsWith('/admin/media') ? 'media' : null),
}));
vi.mock('./admin-nav-groups', () => ({
  filterNavLeaves: (_p: unknown, isVisible: (item: unknown) => boolean) => {
    const items = [
      { to: '/admin/jedan', moduleKeys: ['a'] },
      { to: '/admin/x', moduleKeys: ['a', 'b'] },
      { to: '/admin/y', moduleKeys: ['a', 'b'] },
      { to: '/admin/z' },
      { to: '/admin/media' },
      { to: '/admin/media/folders' },
    ];
    state.visible = items.map((item) => isVisible(item));
    return [];
  },
}));
vi.mock('../notifications/NotificationBell', () => ({ NotificationBell: () => null }));
vi.mock('../common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../common/RouteLoading', () => ({ RouteLoading: () => null }));
vi.mock('../ui/sheet', () => ({
  Sheet: () => null,
  SheetHeader: () => null,
  SheetContent: () => null,
}));
vi.mock('./AdminSidebarNav', () => ({ AdminSidebarNav: () => null }));
vi.mock('./AdminShowcaseBanner', () => ({ AdminShowcaseBanner: () => null }));
vi.mock('./AdminCommandPalette', () => ({ AdminCommandPalette: () => null }));

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<p>pocetna</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('AdminLayout — vidljivost modula u navigaciji', () => {
  it('modul sa ključevima je vidljiv kad je barem jedan uključen', () => {
    state.publicSettings = { a: true, b: false, media: false };
    state.privateSettings = {};
    renderLayout();
    expect(state.visible).toEqual([true, true, true, true, false, false]);
  });

  it('modul sa ključevima je skriven kad su svi isključeni', () => {
    state.publicSettings = { a: false, b: false, media: false };
    state.privateSettings = {};
    renderLayout();
    expect(state.visible).toEqual([false, false, false, true, false, false]);
  });

  it('privatne postavke nadjačavaju javne pri spajanju', () => {
    state.publicSettings = { a: true, b: true, media: true };
    state.privateSettings = { a: false, b: false, media: false };
    renderLayout();
    expect(state.visible).toEqual([false, false, false, true, false, false]);
  });

  it('stavka bez module ključa je uvijek vidljiva', () => {
    state.publicSettings = { a: false, b: false, media: false };
    state.privateSettings = {};
    renderLayout();
    expect(state.visible[3]).toBe(true);
  });

  it('stavka bez prepoznatog modula ostaje vidljiva uprkos postavkama', () => {
    state.publicSettings = { media: false };
    state.privateSettings = { media: false };
    renderLayout();
    expect(state.visible[3]).toBe(true);
  });

  it('stavka sa prepoznatim modulom prati postavku', () => {
    state.publicSettings = { media: true };
    state.privateSettings = {};
    renderLayout();
    expect(state.visible.slice(4)).toEqual([true, true]);
  });
});
