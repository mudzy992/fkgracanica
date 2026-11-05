import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketsReserveForm } from './TicketsReserveForm';

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

describe('TicketsReserveForm — nedostupna prodaja', () => {
  it('bez ijednog kanala prodaje prikazuje poruku', () => {
    state.config = config({ salesModes: { boxOffice: false, online: false } });
    renderForm();
    expect(screen.getByText('Kupovina ulaznica trenutno nije dostupna.')).toBeInTheDocument();
  });

  it('bez zakazane utakmice prikazuje poruku', () => {
    state.config = config({ activeTicketMatch: null });
    renderForm();
    expect(screen.getByText('Trenutno nema zakazane domaće utakmice za ulaznice.')).toBeInTheDocument();
  });

  it('bez konfiguracije nema prodaje', () => {
    state.config = undefined;
    renderForm();
    expect(screen.getByText('Kupovina ulaznica trenutno nije dostupna.')).toBeInTheDocument();
  });
});

describe('TicketsReserveForm — prikaz utakmice i kategorija', () => {
  it('prikazuje utakmicu, termin i kategorije sa cijenama', () => {
    renderForm();
    expect(screen.getByText('FK Gračanica vs NK Zenica')).toBeInTheDocument();
    expect(screen.getByText('subota, 10.05.2026 u 17:00')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tribina — 10 KM' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Kategorija ulaznice' })).toBeInTheDocument();
  });

  it('traži dostupnost za aktivnu utakmicu', () => {
    renderForm();
    expect(state.askedMatchId).toBe('m1');
  });

  it('kategorija bez izbora ne prikazuje cijenu ni akcije', () => {
    renderForm();
    expect(screen.queryByText(/Cijena po ulaznici/)).toBeNull();
    expect(screen.queryByRole('button', { name: /^reserve:/ })).toBeNull();
  });

  it('izbor kategorije prikazuje cijenu i akcije sa limitima', async () => {
    const user = userEvent.setup();
    renderForm();
    await pickCategory(user);
    expect(screen.getByText(/Cijena po ulaznici/)).toBeInTheDocument();
    expect(screen.getByText('10.00 KM')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^reserve:m1:1:0/ })).toBeInTheDocument();
  });
});

describe('TicketsReserveForm — dostupnost i popusti', () => {
  it('prikazuje slobodna mjesta, popust i limit blagajne', async () => {
    const user = userEvent.setup();
    state.availability = { remaining: 40, capacity: 100, memberDiscountPercent: 20, maxPerUser: 4, userTickets: 1 };
    renderForm();
    expect(screen.getByText(/Slobodnih mjesta:/)).toBeInTheDocument();
    expect(screen.getByText(/Popust člana: 20%/)).toBeInTheDocument();
    expect(screen.getByText(/Limit blagajna: 1\/4/)).toBeInTheDocument();
    await pickCategory(user);
    expect(screen.getByText('8.00 KM')).toBeInTheDocument();
  });

  it('popust se primjenjuje i na ukupnu cijenu za više ulaznica', async () => {
    const user = userEvent.setup();
    state.availability = { remaining: 40, capacity: 100, memberDiscountPercent: 50, maxPerUser: 4, userTickets: 0 };
    renderForm();
    await pickCategory(user, 'c2');
    fireEvent.change(screen.getByPlaceholderText('Količina'), { target: { value: '2' } });
    await waitFor(() => expect(screen.getByText(/Ukupno: 50\.00 KM/)).toBeInTheDocument());
  });

  it('rasprodato prikazuje upozorenje', () => {
    state.availability = { remaining: 0, capacity: 100, memberDiscountPercent: 0, maxPerUser: 4, userTickets: 0 };
    renderForm();
    expect(screen.getByText('Kapacitet stadiona je popunjen — ulaznice su rasprodane.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^reserve:/ })).toBeNull();
  });

  it('bez dostupnosti koristi limit iz konfiguracije', async () => {
    const user = userEvent.setup();
    renderForm();
    await pickCategory(user);
    expect(state.actions.boxOfficeMax).toBe(4);
    expect(state.actions.onlineMax).toBe(999);
  });
});

describe('TicketsReserveForm — provajderi i uspjeh', () => {
  it('navodi provajdere online plaćanja velikim slovom', () => {
    renderForm();
    expect(screen.getByText(/Stripe, Monri/)).toBeInTheDocument();
    expect(screen.getByText(/plaćanje i preuzimanje ulaznica na stadionu/)).toBeInTheDocument();
  });

  it('uspješna rezervacija prosleđuje id dalje', async () => {
    const user = userEvent.setup();
    renderForm();
    await pickCategory(user);
    await user.click(screen.getByRole('button', { name: /^reserve:/ }));
    expect(state.success).toEqual(['o-1']);
  });

  it('bez online kanala nema informacije o provajderima', () => {
    state.config = config({ salesModes: { boxOffice: true, online: false } });
    renderForm();
    expect(screen.queryByText(/Online plaćanje putem/)).toBeNull();
  });
});
