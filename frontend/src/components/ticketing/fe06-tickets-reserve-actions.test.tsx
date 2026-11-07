import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketsReserveActions } from './TicketsReserveActions';
import {
  reserveProps,
  resetTicketsReserveState, ticketsReserveState as state,
} from '../../test/doubles/tickets-reserve-doubles';

vi.mock('../../hooks/use-online-checkout', async () =>
  (await import('../../test/doubles/tickets-reserve-doubles')).reserveHooksModule()['use-online-checkout']);
vi.mock('../../hooks/use-ticketing', async () =>
  (await import('../../test/doubles/tickets-reserve-doubles')).reserveHooksModule()['use-ticketing']);
vi.mock('../payments/OnlinePaymentChoice', async () =>
  (await import('../../test/doubles/tickets-reserve-doubles')).onlinePaymentChoiceModule());

beforeEach(resetTicketsReserveState);

const Actions = TicketsReserveActions as unknown as (p: Record<string, unknown>) => React.ReactElement;
const renderActions = (over: Record<string, unknown> = {}) =>
  render(<Actions {...reserveProps(over)} />);


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
