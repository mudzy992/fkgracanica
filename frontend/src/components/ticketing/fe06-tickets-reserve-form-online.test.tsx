import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketsReserveForm } from './TicketsReserveForm';

/** Batch 34 — samo online kanal i rubne količine (odvojeno zbog limita dužine). */

const state = vi.hoisted(() => ({
  config: undefined as unknown,
  availability: undefined as unknown,
  success: [] as Array<string | undefined>,
  actions: {} as Record<string, unknown>,
  askedMatchId: null as string | null,
}));

vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: state.config }),
  useMatchAvailability: (matchId?: string) => {
    state.askedMatchId = matchId ?? null;
    return { data: state.availability };
  },
}));
vi.mock('../../lib/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/utils')>()),
  formatDateTime: () => 'subota, 10.05.2026 u 17:00',
}));
vi.mock('./TicketsReserveActions', () => ({
  TicketsReserveActions: (props: Record<string, unknown>) => {
    state.actions = { ...props };
    return (
      <button onClick={() => (props.onReserved as (id?: string) => void)('o-1')}>
        reserve:{String(props.matchId)}:{String(props.quantity)}:{String(props.remaining)}
      </button>
    );
  },
}));

const config = (over: Record<string, unknown> = {}) => ({
  categories: [
    { id: 'c1', label: 'Tribina', price: 10 },
    { id: 'c2', label: 'VIP', price: 50 },
  ],
  salesModes: { boxOffice: true, online: true },
  maxBoxOfficeTicketsPerUser: 4,
  readyProviders: ['stripe', 'monri'],
  activeTicketMatch: {
    id: 'm1',
    scheduledAt: '2026-05-10T17:00:00.000Z',
    homeClub: { name: 'FK Gračanica' },
    awayClub: { name: 'NK Zenica' },
  },
  ...over,
});

const renderForm = () => render(<TicketsReserveForm onSuccess={(id?: string) => state.success.push(id)} />);

const pickCategory = async (user: ReturnType<typeof userEvent.setup>, value = 'c1') => {
  await user.selectOptions(screen.getByRole('combobox'), value);
};

beforeEach(() => {
  state.config = config();
  state.availability = undefined;
  state.success = [];
  state.actions = {};
  state.askedMatchId = null;
});

describe('TicketsReserveForm — samo online i rubne količine (batch 34)', () => {
  it('samo online kanal koristi online limit i nema napomene o blagajni', async () => {
    const user = userEvent.setup();
    state.config = config({ salesModes: { boxOffice: false, online: true } });
    state.availability = { remaining: 7, capacity: 100, memberDiscountPercent: 0, maxPerUser: 4, userTickets: 0 };
    renderForm();
    expect(screen.queryByText(/Rezervacija za blagajnu/)).toBeNull();
    expect(screen.getByText(/Online plaćanje putem/)).toBeInTheDocument();
    await pickCategory(user);
    expect(screen.getByRole('button', { name: /^reserve:m1:1:7/ })).toBeInTheDocument();
    expect((screen.getByPlaceholderText('Količina') as HTMLInputElement).max).toBe('7');
  });

  it('količina nula koristi jedinicu kao prikaz (batch 34)', async () => {
    const user = userEvent.setup();
    renderForm();
    await pickCategory(user);
    fireEvent.change(screen.getByPlaceholderText('Količina'), { target: { value: '0' } });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^reserve:m1:1:/ })).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Ukupno:/)).toBeNull();
  });

  it('bez blagajne nema limita blagajne u zaglavlju (batch 34)', () => {
    state.config = config({ salesModes: { boxOffice: false, online: true } });
    state.availability = { remaining: 40, capacity: 100, memberDiscountPercent: 0, maxPerUser: 4, userTickets: 2 };
    renderForm();
    expect(screen.queryByText(/Limit blagajna/)).toBeNull();
  });
});
