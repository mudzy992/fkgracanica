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
  ],
  sections: [
    { id: 'surfaces', title: 'Površine', body: 'Web, admin, mobile' },
    { id: 'fan', title: 'Put navijača', body: 'Od vijesti do ulaza', moduleIds: ['m1'] },
    { id: 'identity', title: 'Identitet', body: 'Grb i boje', bullets: ['Grb'] },
    { id: 'competition', title: 'Takmičenje', body: 'Liga' },
    { id: 'mobile', title: 'Mobile', body: 'Aplikacija', bullets: ['iOS'], moduleIds: ['m2'] },
  ],
  roles: [{ id: 'r1', title: 'Administrator', who: 'Uprava', tasks: ['Sve'], home: ['KPI'] }],
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <ShowcasePage />
    </MemoryRouter>,
  );

describe('ShowcasePage — varijante bez opcionih sekcija (3 grane)', () => {
  beforeEach(() => {
    state.showcase = { data: undefined, isLoading: false, isError: false };
    state.favicons = [];
    state.seo = [];
  });

  it('bez surfaces sekcije ne prikazuje SurfacesSection ali prikazuje ostalo', () => {
    const full = payload();
    state.showcase = {
      data: { ...full, sections: full.sections.filter((s) => s.id !== 'surfaces') },
      isLoading: false,
      isError: false,
    };
    renderPage();
    expect(screen.queryByText('Tri površine')).toBeNull();
    expect(screen.queryByText('Web, admin, mobile')).toBeNull();
    expect(screen.getByText('Od vijesti do ulaza')).toBeInTheDocument();
  });

  it('bez fan sekcije ne prikazuje JourneySection', () => {
    const full = payload();
    state.showcase = {
      data: { ...full, sections: full.sections.filter((s) => s.id !== 'fan') },
      isLoading: false,
      isError: false,
    };
    renderPage();
    expect(screen.queryByText('Od vijesti do ulaza')).toBeNull();
    expect(screen.getByText('Tri površine')).toBeInTheDocument();
  });

  it('bez mobile sekcije ne prikazuje MobileSection', () => {
    const full = payload();
    state.showcase = {
      data: { ...full, sections: full.sections.filter((s) => s.id !== 'mobile') },
      isLoading: false,
      isError: false,
    };
    renderPage();
    // mobile sekcija ima body Aplikacija i bullets iOS/Android
    expect(screen.queryByText('Aplikacija')).toBeNull();
    expect(screen.queryByText('Tri površine')).toBeInTheDocument();
  });

  it('bez sve tri opcione sekcije prikazuje samo katalog i ostale fiksne sekcije', () => {
    const full = payload();
    state.showcase = {
      data: {
        ...full,
        sections: full.sections.filter((s) => !['surfaces', 'fan', 'mobile'].includes(s.id)),
      },
      isLoading: false,
      isError: false,
    };
    renderPage();
    expect(screen.queryByText('Tri površine')).toBeNull();
    expect(screen.queryByText('Od vijesti do ulaza')).toBeNull();
    expect(screen.queryByText('Aplikacija')).toBeNull();
    expect(screen.getByText('Identitet')).toBeInTheDocument();
  });
});
