import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchTicketsSummaryCard } from './MatchTicketsSummaryCard';
import { MyTicketsPanel } from './MyTicketsPanel';

const state = vi.hoisted(() => ({
  config: { data: undefined as unknown },
  orders: { data: undefined as unknown, isLoading: false },
  season: { data: undefined as unknown },
  groups: [] as unknown[],
  result: [] as unknown[],
  dialogs: [] as Record<string, unknown>[],
  seasonCards: [] as unknown[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => state.config,
  useMyTicketOrders: () => state.orders,
  useMySeasonPass: () => state.season,
}));
vi.mock('../../lib/group-tickets-by-match', () => ({
  groupTicketsByMatch: (orders: unknown[]) => {
    state.groups.push(orders);
    return state.result;
  },
  filterTicketOrdersGroups: undefined,
}));
vi.mock('./MatchTicketsDialog', () => ({
  MatchTicketsDialog: (props: Record<string, unknown>) => {
    state.dialogs.push(props);
    return props.group ? (
      <div>
        <div data-testid="tickets-dialog" />
        <button onClick={() => (props.onClose as () => void)()}>zatvori-dialog</button>
      </div>
    ) : null;
  },
}));
vi.mock('./SeasonPassCard', () => ({
  SeasonPassCard: ({ pass }: { pass: unknown }) => {
    state.seasonCards.push(pass);
    return <div data-testid="season-pass" />;
  },
}));

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('MatchTicketsSummaryCard', () => {
  const group = (statuses: string[]) => ({
    matchId: 'm1',
    match: { id: 'm1', scheduledAt: '2026-05-01T17:00:00.000Z', homeClub: { name: 'FK Gračanica' }, awayClub: { name: 'FK Slavija' } },
    items: statuses.map((status, i) => ({ ticket: { id: `t${i}`, status }, order: { id: 'o1' } })),
  });

  it('prikazuje brojanje po statusu i klik javlja roditelju', async () => {
    const onClick = vi.fn();
    wrap(<MatchTicketsSummaryCard group={group(['PAID_AT_BOX_OFFICE', 'PAID_AT_BOX_OFFICE', 'RESERVED', 'USED']) as never} onClick={onClick} />);
    expect(screen.getByText(/2 plaćene/)).toBeTruthy();
    expect(screen.getByText(/1 rezervisana/)).toBeTruthy();
    expect(screen.getByText(/1 zatvorena/)).toBeTruthy();
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('bez plaćenih i rezervisanih nema tih znački', () => {
    wrap(<MatchTicketsSummaryCard group={group(['USED']) as never} onClick={vi.fn()} />);
    expect(screen.queryByText(/plaćen/)).toBeNull();
    expect(screen.queryByText(/rezervisan/)).toBeNull();
    expect(screen.getByText(/1 zatvorena/)).toBeTruthy();
  });

  it('bez datuma utakmice nema reda sa datumom', () => {
    const g = { matchId: 'm1', match: { id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } }, items: [] };
    wrap(<MatchTicketsSummaryCard group={g as never} onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });
});

describe('MyTicketsPanel', () => {
  beforeEach(() => {
    state.orders = { data: [], isLoading: false };
    state.season = { data: undefined };
    state.groups = [];
    state.result = [];
    state.dialogs = [];
    state.seasonCards = [];
  });

  it('dok se narudžbe učitavaju prikazuje skeleton', () => {
    state.orders = { data: undefined, isLoading: true };
    const { container } = wrap(<MyTicketsPanel />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('prikazuje zaglavlje, filtere i link na kupovinu', () => {
    wrap(<MyTicketsPanel />);
    expect(screen.getByText('Moje ulaznice')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Kupi ulaznice/ }).getAttribute('href')).toBe('/ulaznice');
    expect(screen.getByRole('button', { name: 'Kupljene' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sve' })).toBeTruthy();
  });

  it('bez narudžbi prikazuje poruku za odabrani filter', () => {
    wrap(<MyTicketsPanel />);
    expect(screen.getByText(/Nema ulaznica u kategoriji/)).toBeTruthy();
  });

  it('promjena filtera mijenja aktivno dugme', async () => {
    wrap(<MyTicketsPanel />);
    await userEvent.click(screen.getByRole('button', { name: 'Sve' }));
    expect(screen.getByText(/„Sve”/)).toBeTruthy();
  });

  it('uspješna uplata prikazuje potvrdu', () => {
    wrap(<MyTicketsPanel paymentSuccess />);
    expect(screen.getByText(/Uplata je uspješna/)).toBeTruthy();
  });

  it('aktivna sezonska karta se prikazuje', () => {
    state.season = { data: { pass: { id: 's1', status: 'ACTIVE' } } };
    wrap(<MyTicketsPanel />);
    expect(screen.getByText('Sezonska karta')).toBeTruthy();
    expect(screen.getByTestId('season-pass')).toBeTruthy();
  });

  it('neaktivna sezonska karta se ne prikazuje', () => {
    state.season = { data: { pass: { id: 's1', status: 'CANCELLED' } } };
    wrap(<MyTicketsPanel />);
    expect(screen.queryByText('Sezonska karta')).toBeNull();
  });

  it('bez odabrane grupe dijalog se ne prikazuje', () => {
    wrap(<MyTicketsPanel />);
    expect(state.dialogs[0]).toMatchObject({ group: null, open: false });
    expect(screen.queryByTestId('tickets-dialog')).toBeNull();
  });

  it('klik na karticu utakmice otvara dijalog, zatvaranje ga čisti', async () => {
    const user = userEvent.setup();
    state.result = [{
      matchId: 'm1',
      match: { id: 'm1', scheduledAt: '2026-05-01T17:00:00.000Z', homeClub: { name: 'FK Gračanica' }, awayClub: { name: 'FK Slavija' } },
      items: [{ ticket: { id: 't1', status: 'PAID_AT_BOX_OFFICE' }, order: { id: 'o1' } }],
    }];
    wrap(<MyTicketsPanel />);
    expect(screen.queryByTestId('tickets-dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: /FK Gračanica/ }));
    expect(screen.getByTestId('tickets-dialog')).toBeTruthy();
    expect(state.dialogs.at(-1)).toMatchObject({ open: true, group: { matchId: 'm1' } });
    await user.click(screen.getByRole('button', { name: 'zatvori-dialog' }));
    expect(state.dialogs.at(-1)).toMatchObject({ open: false, group: null });
  });
});
