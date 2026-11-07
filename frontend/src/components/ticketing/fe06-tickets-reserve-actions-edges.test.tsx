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


describe('TicketsReserveActions — zaštite i kombinovani prikaz', () => {
  it('klik na provajdera iznad limita ne šalje rezervaciju', async () => {
    const user = userEvent.setup();
    renderActions({ quantity: 11 });
    await user.click(screen.getByRole('button', { name: 'online-stripe' }));
    await waitFor(() => expect(state.reserve).not.toHaveBeenCalled());
    expect(state.reserved).toEqual([]);
  });

  it('klik na provajdera kad je rasprodato ne šalje rezervaciju', async () => {
    const user = userEvent.setup();
    renderActions({ remaining: 0 });
    await user.click(screen.getByRole('button', { name: 'online-stripe' }));
    await waitFor(() => expect(state.reserve).not.toHaveBeenCalled());
  });

  it('odabir provajdera pokreće online rezervaciju sa tim provajderom', async () => {
    const user = userEvent.setup();
    renderActions();
    await user.click(screen.getByRole('button', { name: 'online-stripe' }));
    await waitFor(() => expect(state.reserve).toHaveBeenCalledWith(expect.objectContaining({
      matchId: 'm1', quantity: 2,
    })));
  });

  it('kombinovani prikaz koristi svoj izbor provajdera', async () => {
    const user = userEvent.setup();
    renderActions({ boxOffice: true, online: true });
    await user.click(screen.getByRole('button', { name: 'online-stripe' }));
    await waitFor(() => expect(state.reserve).toHaveBeenCalledWith(expect.objectContaining({
      matchId: 'm1', quantity: 2,
    })));
    expect(state.reserved).toEqual(['o1']);
  });
});
