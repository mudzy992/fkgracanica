import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShowcasePage } from './ShowcasePage';
import type { ShowcasePayload } from './types';

const state = vi.hoisted(() => ({
  showcase: { data: undefined as unknown, isLoading: false, isError: false },
  favicons: [] as (string | undefined)[],
  seo: [] as Record<string, unknown>[],
}));

vi.mock('../../hooks/use-showcase', () => ({ useShowcase: () => state.showcase }));
vi.mock('../../hooks/use-dynamic-favicon', () => ({
  useDynamicFavicon: (url?: string) => {
    state.favicons.push(url);
  },
}));
vi.mock('../../hooks', () => ({
  useContactSubmit: () => ({ mutateAsync: vi.fn(async () => ({})), isPending: false }),
  useSubscribeNewsletter: () => ({
    mutateAsync: vi.fn(async () => ({})),
    isPending: false,
    isError: false,
    error: null,
  }),
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));

const payload = (over: Partial<ShowcasePayload> = {}): ShowcasePayload => ({
  modeOn: true,
  overallPercent: 78,
  club: {
    name: 'FK Gračanica',
    tagline: 'Ponos Gračanice',
    crestUrl: 'originals/crest.png',
    email: 'info@fk.ba',
    phone: '+387 61 000',
    address: 'Gračanica',
    launchNote: 'Lansiranje u septembru.',
  },
  modules: [
    { id: 'm1', title: 'Vijesti', percent: 100, badge: 'ready', surfaces: ['web'], summary: 'CMS' },
    { id: 'm2', title: 'Liga', percent: 60, badge: 'in_progress', surfaces: ['web'], summary: 'Tabela' },
    { id: 'm3', title: 'Mobile', percent: 20, badge: 'after_launch', surfaces: ['mobile'], summary: 'App' },
    { id: 'm4', title: 'Blagajna', percent: 90, badge: 'web_only', surfaces: ['admin'], summary: 'Prodaja' },
  ],
  sections: [
    { id: 'surfaces', title: 'Površine', body: 'Web, admin, mobile' },
    { id: 'fan', title: 'Put navijača', body: 'Od vijesti do ulaza', moduleIds: ['m1', 'm2'] },
    { id: 'identity', title: 'Identitet', body: 'Grb i boje', bullets: ['Grb', 'Boje'] },
    { id: 'competition', title: 'Takmičenje', body: 'Liga', moduleIds: ['m2'] },
    { id: 'membership-tickets', title: 'Članstvo', body: 'Kartice', moduleIds: ['m1'] },
    { id: 'content', title: 'Sadržaj', body: 'Vijesti', bullets: ['CMS'] },
    { id: 'admin', title: 'Admin', body: 'Uloge' },
    { id: 'club-needs', title: 'Potrebe kluba', body: 'Sve' },
    { id: 'mobile', title: 'Mobile', body: 'Aplikacija', bullets: ['iOS', 'Android'], moduleIds: ['m3'] },
  ],
  roles: [
    { id: 'r1', title: 'Administrator', who: 'Uprava', tasks: ['Sve'], home: ['KPI'] },
    { id: 'r2', title: 'Komentator', who: 'Novinar', tasks: ['Live'], home: [] },
  ],
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <ShowcasePage />
    </MemoryRouter>,
  );

describe('ShowcasePage', () => {
  beforeEach(() => {
    state.showcase = { data: undefined, isLoading: false, isError: false };
    state.favicons = [];
    state.seo = [];
  });

  it('postavlja SEO i dodaje scroll-smooth klasu', () => {
    renderPage();
    expect(state.seo[0]).toMatchObject({ title: 'Platforma u izradi' });
    expect(document.documentElement.classList.contains('scroll-smooth')).toBe(true);
  });

  it('dok se prezentacija učitava prikazuje poruku', () => {
    state.showcase = { data: undefined, isLoading: true, isError: false };
    renderPage();
    expect(screen.getByText('Učitavanje prezentacije…')).toBeTruthy();
  });

  it('greška prikazuje poruku bez sadržaja', () => {
    state.showcase = { data: undefined, isLoading: false, isError: true };
    renderPage();
    expect(screen.getByText('Prezentacija trenutno nije dostupna.')).toBeTruthy();
    expect(screen.queryByText('Mapa isporuke')).toBeNull();
  });

  it('sa podacima prikazuje hero, sekcije i kontakt', () => {
    state.showcase = { data: payload(), isLoading: false, isError: false };
    renderPage();
    expect(screen.getAllByText('FK Gračanica').length).toBeGreaterThan(0);
    expect(screen.getByText('Ponos Gračanice')).toBeTruthy();
    expect(screen.getByText('78%')).toBeTruthy();
    expect(screen.getAllByText('Površine').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Put navijača').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Uloge i zadaci').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mapa isporuke').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ostajemo u vezi').length).toBeGreaterThan(0);
  });

  it('favicon koristi grb iz podataka', () => {
    state.showcase = { data: payload(), isLoading: false, isError: false };
    renderPage();
    expect(state.favicons.at(-1)).toBe('originals/crest.png');
  });

  it('katalog sekcije dobijaju module i bedževe', () => {
    state.showcase = { data: payload(), isLoading: false, isError: false };
    renderPage();
    expect(screen.getAllByText('Vijesti').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Spremno').length).toBeGreaterThan(0);
    expect(screen.getAllByText('U toku · 60%').length).toBeGreaterThan(0);
  });

  it('mapa isporuke grupiše module po statusu i preskače prazne grupe', () => {
    state.showcase = {
      data: payload({ modules: [payload().modules[0]] }),
      isLoading: false,
      isError: false,
    };
    renderPage();
    expect(screen.getAllByText('Spremno za lansiranje').length).toBeGreaterThan(0);
    expect(screen.queryByText('U toku')).toBeNull();
    expect(screen.queryByText('Namjerno web-only')).toBeNull();
  });

  it('rola bez početnog ekrana nema sekciju zadataka', () => {
    state.showcase = { data: payload(), isLoading: false, isError: false };
    renderPage();
    expect(screen.getAllByText('Administrator').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Na početnom ekranu').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Komentator').length).toBeGreaterThan(0);
  });
});

describe('ShowcasePage — djelimični katalog', () => {
  it('preskače katalog sekciju koja nedostaje', () => {
    const full = payload();
    const first = renderPage();
    expect(screen.getByText('Potrebe kluba')).toBeTruthy();
    first.unmount();
    state.showcase = {
      data: { ...full, sections: full.sections.filter((x) => x.id !== 'club-needs') },
      isLoading: false,
      isError: false,
    };
    renderPage();
    expect(screen.queryByText('Potrebe kluba')).toBeNull();
    expect(screen.getByText('Identitet')).toBeTruthy();
  });
});
