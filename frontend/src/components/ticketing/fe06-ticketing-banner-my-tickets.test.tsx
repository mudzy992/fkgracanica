import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeNextMatchTicketsBanner } from './HomeNextMatchTicketsBanner';

const state = vi.hoisted(() => ({
  config: { data: undefined as unknown },
  nextMatch: { data: undefined as unknown, isLoading: false },
  orders: { data: undefined as unknown, isLoading: false },
  season: { data: undefined as unknown },
  groups: [] as unknown[],
  dialogs: [] as Record<string, unknown>[],
  seasonCards: [] as unknown[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => state.config,
  useNextHomeMatch: () => state.nextMatch,
  useMyTicketOrders: () => state.orders,
  useMySeasonPass: () => state.season,
}));
vi.mock('../../lib/group-tickets-by-match', () => ({
  groupTicketsByMatch: (orders: unknown[]) => {
    state.groups.push(orders);
    return state.groups.length ? [] : [];
  },
  filterTicketOrdersGroups: undefined,
}));
vi.mock('./MatchTicketsDialog', () => ({
  MatchTicketsDialog: (props: Record<string, unknown>) => {
    state.dialogs.push(props);
    return props.group ? <div data-testid="tickets-dialog" /> : null;
  },
}));
vi.mock('./SeasonPassCard', () => ({
  SeasonPassCard: ({ pass }: { pass: unknown }) => {
    state.seasonCards.push(pass);
    return <div data-testid="season-pass" />;
  },
}));

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const nextMatch = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  scheduledAt: '2026-05-01T17:00:00.000Z',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  ...over,
});

describe('HomeNextMatchTicketsBanner', () => {
  beforeEach(() => {
    state.config = { data: undefined };
    state.nextMatch = { data: undefined, isLoading: false };
  });

  it('bez modula ulaznica ne renderira ništa', () => {
    const { container } = wrap(<HomeNextMatchTicketsBanner />);
    expect(container.textContent).toBe('');
  });

  it('bez načina prodaje ne renderira ništa', () => {
    state.config = { data: { modulesTicketing: true, salesModes: { boxOffice: false, online: false } } };
    const { container } = wrap(<HomeNextMatchTicketsBanner />);
    expect(container.textContent).toBe('');
  });

  it('dok se utakmica učitava prikazuje skeleton', () => {
    state.config = { data: { modulesTicketing: true, salesModes: { online: true } } };
    state.nextMatch = { data: undefined, isLoading: true };
    const { container } = wrap(<HomeNextMatchTicketsBanner />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('bez sljedeće utakmice ne renderira ništa', () => {
    state.config = { data: { modulesTicketing: true, salesModes: { boxOffice: true } } };
    const { container } = wrap(<HomeNextMatchTicketsBanner />);
    expect(container.textContent).toBe('');
  });

  it('prikazuje naslov, opis i link na kupovinu', () => {
    state.config = { data: { modulesTicketing: true, salesModes: { online: true } } };
    state.nextMatch = { data: nextMatch(), isLoading: false };
    wrap(<HomeNextMatchTicketsBanner />);
    expect(screen.getByText('Ulaznice za sljedeću utakmicu')).toBeTruthy();
    expect(screen.getByText(/FK Gračanica vs FK Slavija/)).toBeTruthy();
    const link = screen.getByRole('link', { name: /Kupi ulaznice/ });
    expect(link.getAttribute('href')).toBe('/ulaznice?matchId=m1');
  });

  it('proslijeđeni tekstovi zamjenjuju zadane', () => {
    state.config = { data: { modulesTicketing: true, salesModes: { boxOffice: true } } };
    state.nextMatch = { data: nextMatch({ awayClub: null }), isLoading: false };
    wrap(
      <HomeNextMatchTicketsBanner title="Naslov" text="Opis" buttonLabel="Rezerviši" />,
    );
    expect(screen.getByText('Naslov')).toBeTruthy();
    expect(screen.getByText('Opis')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Rezerviši/ })).toBeTruthy();
  });

  it('bez protivnika koristi rezervni naziv', () => {
    state.config = { data: { modulesTicketing: true, salesModes: { online: true } } };
    state.nextMatch = { data: nextMatch({ awayClub: null, homeClub: null }), isLoading: false };
    wrap(<HomeNextMatchTicketsBanner />);
    expect(screen.getByText(/FK Gračanica vs gost/)).toBeTruthy();
  });
});
