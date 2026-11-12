import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicFooter } from './PublicFooter';
import { AdminShowcaseBanner } from './AdminShowcaseBanner';

const state = vi.hoisted(() => ({
  settings: undefined as Record<string, string> | undefined,
  auth: { isAuthenticated: false, user: null as { permissions?: string[] } | null },
  latest: null as { version: string } | null,
  flags: {} as Record<string, string>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: state.settings }),
  useModuleFlags: () => ({ data: state.flags }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../hooks/use-latest-android-release', () => ({
  useLatestAndroidRelease: () => ({ data: state.latest }),
}));

const navItems = [
  { to: '/', label: 'Početna' },
  { to: '/vijesti', label: 'Vijesti' },
  { to: '/galerija', label: 'Galerija' },
  { to: '/tim', label: 'Tim' },
  { to: '/liga', label: 'Liga' },
  { to: '/sponzori', label: 'Sponzori' },
  { to: '/kontakt', label: 'Kontakt' },
  { to: 'https://ffbih.ba', label: 'Savez', external: true },
];

const renderFooter = () =>
  render(
    <MemoryRouter>
      <PublicFooter clubName="FK Gračanica" crestUrl="crest.png" footerText="Sva prava zadržana." navItems={navItems} />
    </MemoryRouter>,
  );

describe('PublicFooter', () => {
  beforeEach(() => {
    state.settings = {
      'club.tagline': 'Ponos Gračanice',
      'contact.email': 'info@fkgracanica.ba',
      'contact.phone': '+387 35 000 000',
      'contact.address': 'Gračanica bb',
    };
    state.auth = { isAuthenticated: false, user: null };
    state.latest = null;
  });

  it('prikazuje grb, slogan, opis, kontakt i najviše šest brzih linkova', () => {
    renderFooter();
    expect(screen.getByAltText('FK Gračanica').getAttribute('src')).toContain('crest.png');
    expect(screen.getByText('Ponos Gračanice')).toBeTruthy();
    expect(screen.getByText('Sva prava zadržana.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'info@fkgracanica.ba' }).getAttribute('href')).toBe(
      'mailto:info@fkgracanica.ba',
    );
    expect(screen.getByText('+387 35 000 000')).toBeTruthy();
    expect(screen.getByText('Gračanica bb')).toBeTruthy();
    expect(screen.getByText(`© ${new Date().getFullYear()} FK Gračanica`)).toBeTruthy();

    const quickLinks = screen.getAllByRole('link').filter((link) => link.className.includes('hover:text-white'));
    expect(quickLinks).toHaveLength(6);
    expect(quickLinks.map((link) => link.textContent)).not.toContain('Savez');
  });

  it('bez kontakt podataka i bez prijavljenog osoblja nema dodatnih stavki', () => {
    state.settings = {};
    renderFooter();
    expect(screen.queryByRole('link', { name: /mailto|info@/ })).toBeNull();
    expect(screen.queryByText('Ponos Gračanice')).toBeNull();
    expect(screen.queryByRole('link', { name: 't:footer.dashboard' })).toBeNull();
  });

  it('prijavljeno osoblje dobija link na administraciju', () => {
    state.auth = { isAuthenticated: true, user: { permissions: ['news.read'] } };
    renderFooter();
    const dashboard = screen.getByRole('link', { name: 't:footer.dashboard' });
    expect(dashboard.getAttribute('href')).toBe('/admin');
  });

  it('prijavljeni korisnik bez dozvola ne dobija link na administraciju', () => {
    state.auth = { isAuthenticated: true, user: { permissions: [] } };
    renderFooter();
    expect(screen.queryByRole('link', { name: 't:footer.dashboard' })).toBeNull();
  });
});

describe('FooterAppDownloadCta', () => {
  it('bez objavljenog izdanja ne prikazuje poziv', () => {
    state.latest = null;
    renderFooter();
    expect(screen.queryByRole('link', { name: 't:footer.appCta' })).toBeNull();
  });

  it('sa izdanjem prikazuje verziju i vodi na stranicu aplikacije', () => {
    state.latest = { version: '1.4.2' };
    renderFooter();
    expect(screen.getByText('t:footer.appVersion')).toBeTruthy();
    expect(screen.getByRole('link', { name: 't:footer.appCta' }).getAttribute('href')).toBe('/aplikacija');
  });
});

describe('AdminShowcaseBanner', () => {
  it('bez uključenog showcase moda ne prikazuje ništa', () => {
    state.flags = { 'feature.showcaseMode': 'false' };
    const { container } = render(
      <MemoryRouter>
        <AdminShowcaseBanner />
      </MemoryRouter>,
    );
    expect(container.textContent).toBe('');
  });

  it('sa uključenim modom prikazuje upozorenje i dva linka', () => {
    state.flags = { 'feature.showcaseMode': 'true' };
    render(
      <MemoryRouter>
        <AdminShowcaseBanner />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Javnost vidi prezentaciju/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Otvori' }).getAttribute('href')).toBe('/platforma');
    expect(screen.getByRole('link', { name: 'Postavke' }).getAttribute('href')).toBe('/admin/settings');
  });
});
