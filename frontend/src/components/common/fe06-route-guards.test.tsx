import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { ModuleRoute } from './ModuleRoute';
import { ShowcaseGate } from './ShowcaseGate';

const state = vi.hoisted(() => ({
  auth: { isAuthenticated: true, isLoading: false, user: { permissions: ['news.read'] } as { permissions?: string[] } | null },
  flags: { data: {} as Record<string, string> | undefined, isLoading: false },
}));

vi.mock('../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../hooks', () => ({ useModuleFlags: () => state.flags }));
vi.mock('../../pages/showcase/ShowcasePage', () => ({
  ShowcasePage: () => <p>showcase-stranica</p>,
}));

function FromProbe() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from;
  return <p>prijava-od:{from?.pathname ?? '-'}</p>;
}

const renderProtected = () =>
  render(
    <MemoryRouter initialEntries={['/admin/vijesti']}>
      <Routes>
        <Route path="/prijava" element={<FromProbe />} />
        <Route path="/clanstvo" element={<p>clanstvo-stranica</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/vijesti" element={<p>admin-sadrzaj</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    state.auth = { isAuthenticated: true, isLoading: false, user: { permissions: ['news.read'] } };
  });

  it('prikazuje skeleton dok traje provjera sesije', () => {
    state.auth = { isAuthenticated: false, isLoading: true, user: null };
    const { container } = renderProtected();
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
    expect(screen.queryByText('admin-sadrzaj')).toBeNull();
  });

  it('neprijavljenog korisnika šalje na prijavu i pamti odakle je došao', () => {
    state.auth = { isAuthenticated: false, isLoading: false, user: null };
    renderProtected();
    expect(screen.getByText('prijava-od:/admin/vijesti')).toBeTruthy();
  });

  it('korisnika bez ijedne dozvole šalje na članstvo', () => {
    state.auth = { isAuthenticated: true, isLoading: false, user: { permissions: [] } };
    renderProtected();
    expect(screen.getByText('clanstvo-stranica')).toBeTruthy();
  });

  it('osoblje sa dozvolom vidi sadržaj', () => {
    renderProtected();
    expect(screen.getByText('admin-sadrzaj')).toBeTruthy();
  });
});

describe('ModuleRoute', () => {
  const renderModule = (moduleKey: string, redirectTo?: string) =>
    render(
      <MemoryRouter initialEntries={['/vijesti']}>
        <Routes>
          <Route path="/" element={<p>pocetna</p>} />
          <Route element={<ModuleRoute moduleKey={moduleKey} redirectTo={redirectTo} />}>
            <Route path="/vijesti" element={<p>modul-sadrzaj</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

  it('dok se zastavice učitavaju ne renderuje ništa', () => {
    state.flags = { data: undefined, isLoading: true };
    const { container } = renderModule('modules.news');
    expect(container.textContent).toBe('');
  });

  it('isključen modul preusmjerava na podrazumijevanu rutu', () => {
    state.flags = { data: { 'modules.news': 'false' }, isLoading: false };
    renderModule('modules.news');
    expect(screen.getByText('pocetna')).toBeTruthy();
  });

  it('isključen modul preusmjerava na zadatu rutu', () => {
    state.flags = { data: { 'modules.news': 'false' }, isLoading: false };
    render(
      <MemoryRouter initialEntries={['/vijesti']}>
        <Routes>
          <Route path="/liga" element={<p>liga-stranica</p>} />
          <Route element={<ModuleRoute moduleKey="modules.news" redirectTo="/liga" />}>
            <Route path="/vijesti" element={<p>modul-sadrzaj</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('liga-stranica')).toBeTruthy();
  });

  it('uključen modul propušta sadržaj', () => {
    state.flags = { data: { 'modules.news': 'true' }, isLoading: false };
    renderModule('modules.news');
    expect(screen.getByText('modul-sadrzaj')).toBeTruthy();
  });
});

describe('ShowcaseGate', () => {
  const renderGate = (url: string) =>
    render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route element={<ShowcaseGate />}>
            <Route path="/" element={<p>prava-pocetna</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

  it('dok se zastavice učitavaju ne renderuje ništa', () => {
    state.flags = { data: undefined, isLoading: true };
    const { container } = renderGate('/');
    expect(container.textContent).toBe('');
  });

  it('uključen showcase mod prikazuje prezentaciju', () => {
    state.flags = { data: { 'feature.showcaseMode': 'true' }, isLoading: false };
    renderGate('/');
    expect(screen.getByText('showcase-stranica')).toBeTruthy();
  });

  it('preview parametar radi i dok se zastavice učitavaju', () => {
    state.flags = { data: undefined, isLoading: true };
    renderGate('/?showcase=1');
    expect(screen.getByText('showcase-stranica')).toBeTruthy();
  });

  it('isključen mod propušta pravu stranicu', () => {
    state.flags = { data: { 'feature.showcaseMode': 'false' }, isLoading: false };
    renderGate('/');
    expect(screen.getByText('prava-pocetna')).toBeTruthy();
  });
});
