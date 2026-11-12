import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketingSeasonTab } from './TicketingSeasonTab';

vi.mock('../../../components/admin/AdminPageShell', () => ({
  AdminDataTable: ({ rows, empty, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    empty?: string;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
  }) =>
    rows.length === 0 ? (
      <p>{empty}</p>
    ) : (
      <div>
        {rows.map((row) => (
          <div key={row.id} data-testid={`row-${row.id}`}>
            {columns.map((column) => (
              <span key={column.key} data-col={column.key}>{column.render(row as never)}</span>
            ))}
          </div>
        ))}
      </div>
    ),
}));

const state = vi.hoisted(() => ({
  list: { data: undefined as unknown, isLoading: false },
  issue: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-ticketing-admin', () => ({
  useSeasonPassAdminList: () => state.list,
  useIssueSeasonPass: () => state.issue,
}));

const pass = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  status: 'ACTIVE',
  price: 150,
  createdAt: '2026-05-01T10:30:00.000Z',
  user: { email: 'clan@example.com' },
  season: { name: '2025/26' },
  ...over,
});

const emailInput = () =>
  screen.getByPlaceholderText('admin.seasonTicket.emailPlaceholder') as HTMLInputElement;

describe('TicketingSeasonTab', () => {
  beforeEach(() => {
    state.list = { data: [], isLoading: false };
    state.issue = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  });

  it('prikazuje naslov sekcije i prazno stanje tabele', () => {
    render(<TicketingSeasonTab />);
    expect(screen.getByRole('heading', { name: 'admin.seasonTicket.issueTitle' })).toBeTruthy();
    expect(screen.getByText('Nema sezonskih karata.')).toBeTruthy();
  });

  it('dok se lista učitava prikazuje se poruka umjesto tabele', () => {
    state.list = { data: [pass('s1')], isLoading: true };
    render(<TicketingSeasonTab />);
    expect(screen.getByText('admin.common.loading')).toBeTruthy();
    expect(screen.queryByTestId('row-s1')).toBeNull();
  });

  it('red prikazuje korisnika, sezonu, status, cijenu i datum', () => {
    state.list = { data: [pass('s1')], isLoading: false };
    render(<TicketingSeasonTab />);
    const row = screen.getByTestId('row-s1');
    expect(within(row).getByText('clan@example.com')).toBeTruthy();
    expect(within(row).getByText('2025/26')).toBeTruthy();
    expect(within(row).getByText('Aktivna')).toBeTruthy();
    expect(within(row).getByText('150 KM')).toBeTruthy();
    expect(within(row).getByText(/2026/)).toBeTruthy();
  });

  it('dugme je onemogućeno dok nema emaila', async () => {
    render(<TicketingSeasonTab />);
    const button = screen.getByRole('button', { name: 'Izdaj' });
    expect(button).toHaveProperty('disabled', true);
    await userEvent.type(emailInput(), 'clan@example.com');
    expect(button).toHaveProperty('disabled', false);
  });

  it('izdavanje šalje trimovan email i prazni polje', async () => {
    render(<TicketingSeasonTab />);
    await userEvent.type(emailInput(), '  clan@example.com  ');
    await userEvent.click(screen.getByRole('button', { name: 'Izdaj' }));
    expect(state.issue.mutateAsync).toHaveBeenCalledWith('clan@example.com');
    expect(emailInput().value).toBe('');
  });

  it('greška pri izdavanju se prikazuje', async () => {
    state.issue = {
      mutateAsync: vi.fn(async () => {
        throw new Error('kapacitet');
      }),
      isPending: false,
    };
    render(<TicketingSeasonTab />);
    await userEvent.type(emailInput(), 'clan@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Izdaj' }));
    expect(await screen.findByText('Izdavanje nije uspjelo. Provjerite email i kapacitet.')).toBeTruthy();
  });

  it('tokom izdavanja dugme je onemogućeno i piše Izdavanje...', () => {
    state.issue = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<TicketingSeasonTab />);
    expect(screen.getByRole('button', { name: 'Izdavanje...' })).toHaveProperty('disabled', true);
  });
});
