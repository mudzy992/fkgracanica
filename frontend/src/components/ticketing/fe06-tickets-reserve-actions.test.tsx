import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketsReserveActions } from './TicketsReserveActions';

const state = vi.hoisted(() => ({
  reserve: vi.fn(),
  reservePending: false,
  reserveError: null as unknown,
  checkout: vi.fn(),
  checkoutPending: false,
  checkoutError: null as unknown,
  config: { readyProviders: ['stripe'] } as unknown,
  reserved: [] as Array<string | undefined>,
}));

vi.mock('../../hooks/use-online-checkout', () => ({
  useOnlineTicketCheckout: () => ({ mutateAsync: state.checkout, isPending: state.checkoutPending, error: state.checkoutError }),
}));
vi.mock('../../hooks/use-ticketing', () => ({
  useReserveTicket: () => ({ mutateAsync: state.reserve, isPending: state.reservePending, error: state.reserveError }),
  useTicketingPublicConfig: () => ({ data: state.config }),
}));
vi.mock('../payments/OnlinePaymentChoice', () => ({
  OnlinePaymentChoice: ({ providers, disabled, loading, onSelect }: {
    providers: string[]; disabled: boolean; loading: boolean; onSelect: (p: string) => void;
  }) => (
    <div>
      placanje:{providers.join(',')}:{String(disabled)}:{String(loading)}
      {providers.map((p) => (<button key={p} onClick={() => onSelect(p)}>online-{p}</button>))}
    </div>
  ),
}));

const props = (over: Record<string, unknown> = {}) => ({
  matchId: 'm1',
  category: { id: 'c1', label: 'Tribina', price: 10 },
  quantity: 2,
  boxOfficeMax: 4,
  onlineMax: 10,
  remaining: 50,
  boxOffice: false,
  online: true,
  onReserved: (id?: string) => state.reserved.push(id),
  ...over,
});

const Actions = TicketsReserveActions as unknown as (p: Record<string, unknown>) => React.ReactElement;
const renderActions = (over: Record<string, unknown> = {}) => render(<Actions {...props(over)} />);

beforeEach(() => {
  state.reserve.mockReset();
  state.reserve.mockResolvedValue({ id: 'o1' });
  state.reservePending = false;
  state.reserveError = null;
  state.checkout.mockReset();
  state.checkout.mockResolvedValue({ url: null });
  state.checkoutPending = false;
  state.checkoutError = null;
  state.config = { readyProviders: ['stripe'] };
  state.reserved = [];
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, href: 'https://fkgracanica.ba/karte' },
  });
});

describe('TicketsReserveActions — režim blagajne', () => {
  it('samo blagajna nudi dugme za rezervaciju', () => {
    renderActions({ boxOffice: true, online: false });
    expect(screen.getByRole('button', { name: 'Rezerviši ulaznice' })).toBeInTheDocument();
    expect(screen.queryByText(/placanje:/)).toBeNull();
  });

  it('rezervacija za blagajnu šalje kategoriju, količinu i način plaćanja', async () => {
    const user = userEvent.setup();
    renderActions({ boxOffice: true, online: false });
    await user.click(screen.getByRole('button', { name: 'Rezerviši ulaznice' }));
    await waitFor(() =>
      expect(state.reserve).toHaveBeenCalledWith({
        matchId: 'm1',
        category: 'Tribina',
        categoryId: 'c1',
        price: 10,
        quantity: 2,
        paymentIntent: 'box_office',
      }),
    );
    expect(state.reserved).toEqual(['o1']);
    expect(state.checkout).not.toHaveBeenCalled();
  });

  it('bez blagajne u prodaji dugme je onemogućeno', () => {
    renderActions({ boxOffice: false, online: false });
    expect(screen.getByRole('button', { name: 'Rezerviši ulaznice' })).toBeDisabled();
  });

  it('količina iznad limita blagajne onemogućava rezervaciju', () => {
    renderActions({ boxOffice: true, online: false, quantity: 5, boxOfficeMax: 4 });
    expect(screen.getByRole('button', { name: 'Rezerviši ulaznice' })).toBeDisabled();
  });

  it('rasprodato onemogućava rezervaciju', () => {
    renderActions({ boxOffice: true, online: false, remaining: 0 });
    expect(screen.getByRole('button', { name: 'Rezerviši ulaznice' })).toBeDisabled();
  });
});

describe('TicketsReserveActions — online plaćanje', () => {
  it('online režim prikazuje izbor provajdera', () => {
    renderActions();
    expect(screen.getByText(/placanje:stripe:false:false/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rezerviši ulaznice' })).toBeNull();
  });

  it('online rezervacija sa URL-om preusmjerava na plaćanje', async () => {
    const user = userEvent.setup();
    state.checkout.mockResolvedValue({ url: 'https://platiti.ba/sesija' });
    renderActions();
    await user.click(screen.getByRole('button', { name: 'online-stripe' }));
    await waitFor(() =>
      expect(state.reserve).toHaveBeenCalledWith(expect.objectContaining({ paymentIntent: 'online' })),
    );
    await waitFor(() => expect(state.checkout).toHaveBeenCalledWith({ orderId: 'o1', provider: 'stripe' }));
    await waitFor(() => expect(window.location.href).toBe('https://platiti.ba/sesija'));
    expect(state.reserved).toEqual([]);
  });

  it('bez URL-a plaćanja prijavljuje rezervaciju sa id-em', async () => {
    const user = userEvent.setup();
    renderActions();
    await user.click(screen.getByRole('button', { name: 'online-stripe' }));
    await waitFor(() => expect(state.reserved).toEqual(['o1']));
    expect(window.location.href).toBe('https://fkgracanica.ba/karte');
  });

  it('greška plaćanja se prikazuje kad rezervacija nema grešku', () => {
    state.checkoutError = new Error('kartica odbijena');
    renderActions();
    expect(screen.getByText('kartica odbijena')).toBeInTheDocument();
  });

  it('nedostatak provajdera prikazuje prazan izbor', () => {
    state.config = { readyProviders: [] };
    renderActions();
    expect(screen.getByText('placanje::false:false')).toBeInTheDocument();
  });

  it('prekoračena online količina ili rasprodato onemogućava izbor', () => {
    const { unmount } = renderActions({ quantity: 11, onlineMax: 10 });
    expect(screen.getByText(/placanje:stripe:true:false/)).toBeInTheDocument();
    unmount();
    renderActions({ quantity: 1, remaining: 0 });
    expect(screen.getByText(/placanje:stripe:true:false/)).toBeInTheDocument();
  });
});

describe('TicketsReserveActions — blagajna + online', () => {
  it('oba režima daju izbor i dugme blagajne', () => {
    renderActions({ boxOffice: true });
    expect(screen.getByText(/placanje:stripe:false:false/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rezerviši za blagajnu' })).toBeInTheDocument();
  });

  it('rezervacija za blagajnu sa oba režima koristi box_office', async () => {
    const user = userEvent.setup();
    renderActions({ boxOffice: true });
    await user.click(screen.getByRole('button', { name: 'Rezerviši za blagajnu' }));
    await waitFor(() =>
      expect(state.reserve).toHaveBeenCalledWith(expect.objectContaining({ paymentIntent: 'box_office' })),
    );
    expect(state.checkout).not.toHaveBeenCalled();
  });

  it('zauzetost menja tekst dugmeta i gasi kontrole', () => {
    state.reservePending = true;
    renderActions({ boxOffice: true });
    expect(screen.getByRole('button', { name: 'Obrada...' })).toBeDisabled();
    expect(screen.getByText(/placanje:stripe:true:true/)).toBeInTheDocument();
  });


  it('greška rezervacije se prikazuje i ne prijavljuje uspjeh', async () => {
    const user = userEvent.setup();
    state.reserve.mockRejectedValue(new Error('nema mjesta'));
    renderActions({ boxOffice: true });
    await user.click(screen.getByRole('button', { name: 'Rezerviši za blagajnu' }));
    await waitFor(() => expect(state.reserve).toHaveBeenCalled());
    state.reserveError = new Error('nema mjesta');
    renderActions({ boxOffice: true });
    expect(screen.getByText('nema mjesta')).toBeInTheDocument();
    expect(state.reserved).toEqual([]);
  });

});
