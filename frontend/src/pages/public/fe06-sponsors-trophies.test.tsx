import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SponsorsPage } from './SponsorsPage';
import { TrophiesPage } from './TrophiesPage';

const state = vi.hoisted(() => ({
  sponsors: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  trophies: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  heroes: [] as Record<string, unknown>[],
  tiers: [] as { tier: string; count: number }[],
  cards: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../hooks', () => ({
  useSponsors: () => state.sponsors,
  useTrophies: () => state.trophies,
}));
vi.mock('../../components/public/sponsors/SponsorsCinematicHero', () => ({
  SponsorsCinematicHero: (props: Record<string, unknown>) => {
    state.heroes.push({ kind: 'sponsors', ...props });
    return <div data-testid="sponsors-hero" />;
  },
}));
vi.mock('../../components/public/sponsors/SponsorsTierSection', () => ({
  SponsorsTierSection: ({ tier, sponsors }: { tier: string; sponsors: unknown[] }) => {
    state.tiers.push({ tier, count: sponsors.length });
    return <div data-testid={`tier-${tier}`} />;
  },
}));
vi.mock('../../components/public/trophies/TrophiesCinematicHero', () => ({
  TrophiesCinematicHero: (props: Record<string, unknown>) => {
    state.heroes.push({ kind: 'trophies', ...props });
    return <div data-testid="trophies-hero" />;
  },
}));
vi.mock('../../components/public/trophies/TrophyFeaturedShowcase', () => ({
  TrophyFeaturedShowcase: ({ trophy }: { trophy: { id: string } }) => {
    state.cards.push(`featured-${trophy.id}`);
    return <div data-testid="trophy-featured" />;
  },
}));
vi.mock('../../components/public/trophies/TrophyCard', () => ({
  TrophyCard: ({ trophy }: { trophy: { id: string } }) => {
    state.cards.push(`card-${trophy.id}`);
    return <div data-testid={`trophy-${trophy.id}`} />;
  },
}));
vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const sponsor = (id: string, tier: string) => ({ id, name: `Sponzor ${id}`, tier });
const trophy = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Trofej ${id}`,
  year: 1999,
  competition: 'Premijer liga',
  imagePath: null,
  description: null,
  featured: false,
  ...extra,
});

const renderPage = (ui: React.ReactElement, query = '') =>
  render(
    <MemoryRouter initialEntries={[`/x${query}`]}>
      {ui}
    </MemoryRouter>,
  );

describe('SponsorsPage', () => {
  beforeEach(() => {
    state.sponsors = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    state.heroes = [];
    state.tiers = [];
  });

  it('dok se sponzori učitavaju prikazuje skeletone', () => {
    state.sponsors = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    const { container } = renderPage(<SponsorsPage />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(7);
    expect(state.tiers).toHaveLength(0);
  });

  it('greška nudi ponovni pokušaj', async () => {
    const refetch = vi.fn();
    state.sponsors = { data: undefined, isLoading: false, isError: true, refetch };
    renderPage(<SponsorsPage />);
    expect(screen.getByRole('alert')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('bez sponzora prikazuje prazno stanje', () => {
    renderPage(<SponsorsPage />);
    expect(screen.getByText('pages.sponsors.empty')).toBeTruthy();
  });

  it('statistika razdvaja premium i partnere', () => {
    state.sponsors = {
      data: [sponsor('1', 'GENERAL'), sponsor('2', 'GOLD'), sponsor('3', 'BRONZE'), sponsor('4', 'PARTNER')],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<SponsorsPage />);
    expect(state.heroes[0]).toMatchObject({ totalCount: 4, premiumCount: 2, partnerCount: 2 });
  });

  it('sponzori se grupišu po tieru', () => {
    state.sponsors = {
      data: [sponsor('1', 'GOLD'), sponsor('2', 'GOLD'), sponsor('3', 'SILVER')],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<SponsorsPage />);
    expect(state.tiers).toEqual([
      { tier: 'GOLD', count: 2 },
      { tier: 'SILVER', count: 1 },
    ]);
  });
});

describe('TrophiesPage', () => {
  beforeEach(() => {
    state.trophies = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    state.heroes = [];
    state.cards = [];
  });

  it('dok se trofeji učitavaju prikazuje skeletone', () => {
    state.trophies = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    const { container } = renderPage(<TrophiesPage />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
  });

  it('greška nudi ponovni pokušaj', async () => {
    const refetch = vi.fn();
    state.trophies = { data: undefined, isLoading: false, isError: true, refetch };
    renderPage(<TrophiesPage />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('bez trofeja prikazuje prazno stanje', () => {
    renderPage(<TrophiesPage />);
    expect(screen.getByText('pages.trophies.empty')).toBeTruthy();
  });

  it('izdvojeni trofej ide u showcase, ostali u mrežu', () => {
    state.trophies = {
      data: [trophy('a'), trophy('b', { featured: true }), trophy('c')],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<TrophiesPage />);
    expect(state.cards).toEqual(['featured-b', 'card-a', 'card-c']);
    expect(screen.getByText('pages.trophies.other')).toBeTruthy();
  });

  it('jedan trofej nema sekciju ostalih', () => {
    state.trophies = { data: [trophy('a')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage(<TrophiesPage />);
    expect(state.cards).toEqual(['featured-a']);
    expect(screen.queryByText('pages.trophies.other')).toBeNull();
  });

  it('hero dobija broj takmičenja bez duplikata', () => {
    state.trophies = {
      data: [
        trophy('a'),
        trophy('b', { competition: 'Premijer liga' }),
        trophy('c', { competition: 'Kup' }),
        trophy('d', { competition: null }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<TrophiesPage />);
    expect(state.heroes[0]).toMatchObject({ totalCount: 4, competitionCount: 2, featuredYear: 1999 });
  });
});
