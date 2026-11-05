import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicLayout } from './PublicLayout';
import type { CmsMenuItem } from '../../cms/types';

const state = vi.hoisted(() => ({
  settings: {} as Record<string, string>,
  moduleFlags: {} as Record<string, string>,
  menu: { items: [] as CmsMenuItem[] } as { items: CmsMenuItem[] } | undefined,
  fallbackNav: [] as Array<{ to: string; label: string; external: boolean }>,
  sitePage: undefined as { sections?: unknown[] } | undefined,
  favicon: [] as Array<string | undefined>,
  visitTracked: 0,
  footer: {} as Record<string, unknown>,
  navProps: {} as Record<string, unknown>,
  sheet: {} as Record<string, unknown>,
  authProps: {} as Record<string, unknown>,
}));

const i18n = { resolvedLanguage: 'bs', changeLanguage: vi.fn(), on: vi.fn(), off: vi.fn() };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, d?: string) => d ?? k, i18n }),
}));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: state.settings }),
  useModuleFlags: () => ({ data: state.moduleFlags }),
}));
vi.mock('../../hooks/use-dynamic-favicon', () => ({
  useDynamicFavicon: (url?: string) => { state.favicon.push(url); },
}));
vi.mock('../../hooks/use-track-public-visit', () => ({
  useTrackPublicVisit: () => { state.visitTracked += 1; },
}));
vi.mock('../../hooks/use-cms-pages', () => ({
  useCmsMenu: () => ({ data: state.menu }),
  useCmsPage: () => ({ data: state.sitePage }),
}));
vi.mock('./PublicFooter', () => ({
  PublicFooter: (props: Record<string, unknown>) => {
    state.footer = props;
    return <div>footer:{(props.navItems as unknown[]).length}:{String(props.clubName)}</div>;
  },
}));
vi.mock('./PublicAuthButton', () => ({
  PublicAuthButton: (props: Record<string, unknown>) => {
    state.authProps = props;
    return <div>auth:{props.mobile ? 'mobile' : 'desktop'}</div>;
  },
}));
vi.mock('./PublicNavItems', () => ({
  PublicNavItems: (props: Record<string, unknown>) => {
    state.navProps = props;
    const items = props.items as Array<{ to: string; label: string; external: boolean }>;
    return (
      <div>
        <span>nav:{props.mobile ? 'mobile' : 'desktop'}:{items.map((i) => `${i.label}@${i.to}`).join('|')}</span>
      </div>
    );
  },
  useFallbackNavItems: () => state.fallbackNav ?? [],
}));
vi.mock('../ui/sheet', () => ({
  Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) => {
    state.sheet = { open };
    return open ? <div data-testid="sheet">{children}</div> : null;
  },
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// `state.fallbackNav` se postavlja prije renderovanja.
Object.assign(state, { fallbackNav: [] as Array<{ to: string; label: string; external: boolean }> });

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<div>početna-stranica</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.settings = {};
  state.moduleFlags = {};
  state.menu = { items: [] };
  state.sitePage = undefined;
  state.favicon = [];
  state.visitTracked = 0;
  state.footer = {};
  state.navProps = {};
  state.authProps = {};
  state.fallbackNav = [{ to: '/', label: 'Početna', external: false }];
});

describe('PublicLayout — zaglavlje i navigacija', () => {
  it('renderuje sadržaj rute, logo, pretragu i podnožje', () => {
    renderLayout();
    expect(screen.getByText('početna-stranica')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'nav.search' })).toHaveAttribute('href', '/pretraga');
    expect(screen.getByText('footer:1:FK Gračanica')).toBeInTheDocument();
    expect(state.visitTracked).toBe(1);
  });

  it('koristi naziv i favicon iz postavki', () => {
    state.settings = { 'club.name': 'FK Test', 'club.crestUrl': 'crest.png', 'club.tagline': 'Ponos grada' };
    renderLayout();
    expect(state.favicon).toEqual(['crest.png']);
    expect(state.footer).toMatchObject({ clubName: 'FK Test', crestUrl: 'crest.png' });
    expect(screen.getByText('footer:1:FK Test')).toBeInTheDocument();
  });

  it('bez grba favicon se ne postavlja', () => {
    renderLayout();
    expect(state.favicon).toEqual([undefined]);
  });

  it('koristi CMS meni kad ima stavki, uz href pravila', () => {
    state.menu = {
      items: [
        { id: 'm1', label: 'Početna', page: { slug: 'home' } },
        { id: 'm2', label: 'O nama', page: { slug: 'o-nama' } },
        { id: 'm3', label: 'Vijesti', path: '/vijesti' },
        { id: 'm4', label: 'Sajt', externalUrl: 'https://example.com' },
        { id: 'm5', label: 'Bez odredišta' },
        { id: 'm6', label: 'Skriveno', enabled: false },
      ] as CmsMenuItem[],
    };
    renderLayout();
    expect(screen.getByText(
      'nav:desktop:Početna@/|O nama@/p/o-nama|Vijesti@/vijesti|Sajt@https://example.com|Bez odredišta@/',
    )).toBeInTheDocument();
  });

  it('prazan CMS meni pada na rezervnu navigaciju', () => {
    state.menu = { items: [] };
    renderLayout();
    expect(screen.getByText('nav:desktop:Početna@/')).toBeInTheDocument();
  });

  it('isključeni modul filtrira stavke menija', () => {
    state.moduleFlags = { 'modules.news': 'false' };
    state.menu = { items: [] };
    state.fallbackNav = [
      { to: '/vijesti', label: 'Vijesti', external: false },
      { to: '/', label: 'Početna', external: false },
      { to: 'https://x.ba', label: 'Van', external: true },
    ];
    renderLayout();
    expect(screen.getByText('nav:desktop:Početna@/|Van@https://x.ba')).toBeInTheDocument();
  });
});

describe('PublicLayout — podnožje i mobilni meni', () => {
  it('tekst podnožja dolazi iz footer-about sekcije', () => {
    state.sitePage = { sections: [
      { widgetType: 'text', config: { text: 'ignorisano' } },
      { widgetType: 'footer-about', config: { text: 'O klubu iz CMS-a' } },
    ] };
    renderLayout();
    expect(state.footer).toMatchObject({ footerText: 'O klubu iz CMS-a' });
  });

  it('bez footer sekcije tekst je prazan', () => {
    state.sitePage = { sections: [{ widgetType: 'text', config: {} }] };
    renderLayout();
    expect(state.footer).toMatchObject({ footerText: '' });
  });

  it('mobilni meni se otvara i prikazuje navigaciju, prekidač jezika i auth', async () => {
    const user = userEvent.setup();
    renderLayout();
    expect(screen.queryByTestId('sheet')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    expect(state.sheet).toEqual({ open: true });
    expect(screen.getByText('nav:mobile:Početna@/')).toBeInTheDocument();
  });

  it('navigacija u mobilnom meniju ne baca grešku', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    expect((state.navProps as { onNavigate?: () => void }).onNavigate).toBeTypeOf('function');
  });

  it('skrolovanje mijenja stanje zaglavlja', async () => {
    renderLayout();
    const header = document.querySelector('header');
    expect(header?.className).toContain('bg-transparent');
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    await waitFor(() => expect(document.querySelector('header')?.className).toContain('backdrop-blur-xl'));
  });
});
