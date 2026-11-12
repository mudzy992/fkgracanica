import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeaturedPlayersWidget } from './FeaturedPlayersWidget';
import { TrophiesWidget } from './TrophiesWidget';

const state = vi.hoisted(() => ({
  club: { data: { id: 'c1' } as unknown },
  players: { data: undefined as unknown, isLoading: false },
  playersQuery: {} as Record<string, unknown>,
  trophies: { data: undefined as unknown, isLoading: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useOwnClub: () => state.club,
  usePlayers: (query: Record<string, unknown>) => {
    state.playersQuery = query;
    return state.players;
  },
  useTrophies: () => state.trophies,
}));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));
vi.mock('../../components/public/trophies/TrophyCard', () => ({
  TrophyCard: ({ trophy }: { trophy: { name: string } }) => <div>kartica:{trophy.name}</div>,
}));
vi.mock('../../components/public/trophies/TrophyFeaturedShowcase', () => ({
  TrophyFeaturedShowcase: ({ trophy, compact }: { trophy: { name: string }; compact?: boolean }) => (
    <div>
      istaknut:{trophy.name}:{String(compact)}
    </div>
  ),
}));

const player = (over: Record<string, unknown> = {}) => ({
  id: 'pl1',
  firstName: 'Asim',
  lastName: 'Softić',
  number: 9,
  position: 'Napadač',
  photoPath: null,
  ...over,
});
const trophy = (over: Record<string, unknown> = {}) => ({
  id: 'tr1',
  name: 'Prvenstvo',
  year: 1974,
  featured: false,
  ...over,
});

beforeEach(() => {
  state.club = { data: { id: 'c1' } };
  state.players = { data: [], isLoading: false };
  state.playersQuery = {};
  state.trophies = { data: [], isLoading: false };
});

describe('FeaturedPlayersWidget', () => {
  it('prikazuje igrače sa brojem i pozicijom te link na profil', () => {
    state.players = { data: [player(), player({ id: 'pl2', firstName: 'Marko', number: null })], isLoading: false };
    render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 4 } as never} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'home.featuredPlayers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Asim/ })).toHaveAttribute('href', '/igrac/pl1');
    expect(screen.getAllByText('Napadač')).toHaveLength(2);
    expect(screen.getAllByText('9').length).toBeGreaterThanOrEqual(1);
    expect(state.playersQuery).toEqual({ clubId: 'c1', activeOnly: true });
  });

  it('bez broja prikazuje upitnik', () => {
    state.players = { data: [player({ number: null })], isLoading: false };
    const { container } = render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 4 } as never} />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('?');
  });

  it('fotografija koristi mediaUrl za medium varijantu', () => {
    state.players = { data: [player({ photoPath: 'originals/igrac.jpg' })], isLoading: false };
    const { container } = render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 4 } as never} />
      </MemoryRouter>,
    );
    const src = container.querySelector('img')?.getAttribute('src') ?? '';
    expect(src).toContain('/uploads/files/medium/igrac.webp');
  });

  it('dok se učitava prikazuje onoliko skeletona koliko je limit', () => {
    state.players = { data: undefined, isLoading: true };
    render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 3 } as never} />
      </MemoryRouter>,
    );
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  it('prazna lista prikazuje poruku i poštuje config naslov', () => {
    render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 4, title: 'Naš tim', viewAllUrl: '/tim' } as never} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Naš tim' })).toBeInTheDocument();
    expect(screen.getByText('Nema aktivnih igrača.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/tim');
  });

  it('bez kluba ne prosljeđuje clubId', () => {
    state.club = { data: undefined };
    render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 4 } as never} />
      </MemoryRouter>,
    );
    expect(state.playersQuery).toEqual({ clubId: undefined, activeOnly: true });
  });
});

describe('TrophiesWidget', () => {
  it('prikazuje istaknuti trofej i preostale kartice', () => {
    state.trophies = {
      data: [trophy({ featured: true }), trophy({ id: 'tr2', name: 'Kup' })],
      isLoading: false,
    };
    render(
      <MemoryRouter>
        <TrophiesWidget config={{ limit: 6 } as never} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'home.trophies' })).toBeInTheDocument();
    expect(screen.getByText('istaknut:Prvenstvo:true')).toBeInTheDocument();
    expect(screen.getByText('kartica:Kup')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/trofeji');
  });

  it('limit umanjuje broj kartica za istaknuti trofej', () => {
    state.trophies = {
      data: [trophy({ featured: true }), trophy({ id: 'tr2', name: 'Kup' }), trophy({ id: 'tr3', name: 'Superkup' })],
      isLoading: false,
    };
    render(
      <MemoryRouter>
        <TrophiesWidget config={{ limit: 2, title: 'Trofeji kluba', viewAllUrl: '/trofeji/svi' } as never} />
      </MemoryRouter>,
    );
    expect(screen.getByText('kartica:Kup')).toBeInTheDocument();
    expect(screen.queryByText('kartica:Superkup')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Trofeji kluba' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/trofeji/svi');
  });

  it('dok se učitava prikazuje četiri skeletona', () => {
    state.trophies = { data: undefined, isLoading: true };
    render(
      <MemoryRouter>
        <TrophiesWidget config={{ limit: 6 } as never} />
      </MemoryRouter>,
    );
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
    expect(screen.queryByText(/istaknut:/)).toBeNull();
  });

  it('bez trofeja prikazuje poruku', () => {
    render(
      <MemoryRouter>
        <TrophiesWidget config={{ limit: 6 } as never} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Nema trofeja.')).toBeInTheDocument();
  });

  it('bez oznake istaknutog koristi prvi trofej kao showcase', () => {
    state.trophies = { data: [trophy()], isLoading: false };
    render(
      <MemoryRouter>
        <TrophiesWidget config={{ limit: 6 } as never} />
      </MemoryRouter>,
    );
    expect(screen.getByText('istaknut:Prvenstvo:true')).toBeInTheDocument();
    expect(screen.queryByText(/kartica:/)).toBeNull();
    expect(screen.queryByText('Nema trofeja.')).toBeNull();
  });
});
