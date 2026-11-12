import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SponsorsWidget } from './SponsorsWidget';

const state = vi.hoisted(() => ({
  sponsors: { data: undefined as unknown, isLoading: false },
  hero: [] as Array<Record<string, unknown>>,
  marquee: [] as Array<Record<string, unknown>>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({ useSponsors: () => state.sponsors }));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));
vi.mock('../../components/public/sponsors/SponsorHeroCard', () => ({
  SponsorHeroCard: ({ sponsor }: { sponsor: { name: string } }) => {
    state.hero.push(sponsor);
    return <div>hero-sponzor:{sponsor.name}</div>;
  },
}));
vi.mock('../../components/public/sponsors/SponsorsMarquee', () => ({
  SponsorMarqueeItem: ({ sponsor }: { sponsor: { name: string } }) => {
    state.marquee.push(sponsor);
    return <div>marquee:{sponsor.name}</div>;
  },
}));

const sponsor = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  name: 'BH Telecom',
  tier: 'GENERAL',
  ...over,
});

const renderWidget = (config: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <SponsorsWidget config={{ limit: 6, ...config } as never} />
    </MemoryRouter>,
  );

beforeEach(() => {
  state.sponsors = {
    data: [sponsor(), sponsor({ id: 's2', name: 'Zlatna banka', tier: 'GOLD' })],
    isLoading: false,
  };
  state.hero = [];
  state.marquee = [];
});

describe('SponsorsWidget', () => {
  it('prikazuje generalnog sponzora kao hero i ostale u mreži', () => {
    renderWidget();
    expect(screen.getByRole('heading', { name: 'home.sponsors' })).toBeInTheDocument();
    expect(screen.getByText('home.sponsorsSubtitle')).toBeInTheDocument();
    expect(screen.getByText('hero-sponzor:BH Telecom')).toBeInTheDocument();
    expect(screen.getByText('marquee:Zlatna banka')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/sponzori');
  });

  it('bez generalnog sponzora nema hero kartice', () => {
    state.sponsors = { data: [sponsor({ id: 's2', name: 'Zlatna banka', tier: 'GOLD' })], isLoading: false };
    renderWidget();
    expect(state.hero).toHaveLength(0);
    expect(screen.getByText('marquee:Zlatna banka')).toBeInTheDocument();
  });

  it('koristi config naslov i viewAllUrl', () => {
    renderWidget({ title: 'Partneri', viewAllUrl: '/partneri' });
    expect(screen.getByRole('heading', { name: 'Partneri' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/partneri');
  });

  it('ograničava broj sponzora prema limitu', () => {
    state.sponsors = {
      data: [
        sponsor({ id: 's1', name: 'Prvi', tier: 'GOLD' }),
        sponsor({ id: 's2', name: 'Drugi', tier: 'SILVER' }),
        sponsor({ id: 's3', name: 'Treći', tier: 'BRONZE' }),
      ],
      isLoading: false,
    };
    renderWidget({ limit: 2 });
    expect(screen.getByText('marquee:Prvi')).toBeInTheDocument();
    expect(screen.queryByText('marquee:Treći')).toBeNull();
  });

  it('dok se podaci učitavaju prikazuje skeletone', () => {
    state.sponsors = { data: undefined, isLoading: true };
    renderWidget();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(5);
    expect(state.hero).toHaveLength(0);
  });

  it('prazna lista prikazuje poruku', () => {
    state.sponsors = { data: [], isLoading: false };
    renderWidget();
    expect(screen.getByText('Nema sponzora.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'home.sponsors' })).toBeInTheDocument();
  });

  it('samo generalni sponzor nema mrežu', () => {
    state.sponsors = { data: [sponsor()], isLoading: false };
    renderWidget();
    expect(state.hero).toHaveLength(1);
    expect(state.marquee).toHaveLength(0);
  });
});
