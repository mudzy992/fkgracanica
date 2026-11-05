import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketingOrdersTab } from './TicketingOrdersTab';
import { ticketingOrdersState as state } from '../../../test/doubles/ticketing-orders-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { permissions: state.canManage ? ['ticketing.manage'] : [] } }),
}));
vi.mock('../../../hooks/use-ticketing-admin', () => ({
  useTicketingAdminOrders: () => state.orders,
  useConfirmTicketingPayment: () => state.confirmPayment,
  useConfirmTicketingRefund: () => state.confirmRefund,
}));
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../../components/ticketing/TicketingValidatePanel', () => ({
  TicketingValidatePanel: () => <div>validate-panel</div>,
}));
vi.mock('../TicketingOrderSheet', () => ({
  TicketingOrderSheet: (props: { order: Record<string, unknown> | null; open: boolean; canManage: boolean }) => {
    state.sheet = props as typeof state.sheet;
    return <div>sheet:{String(props.open)}:{String(props.order?.id ?? '-')}:{String(props.canManage)}</div>;
  },
}));
vi.mock('../../../components/admin/AdminPageShell', async () => ({
  AdminDataTable: (await import('../../../test/doubles/ticketing-orders-doubles')).AdminDataTableDouble,
}));

const order = (over: Record<string, unknown> = {}) => ({
  id: 'ord1234567890', status: 'pending', total: 40, createdAt: '2026-05-01T18:00:00.000Z',
  user: { email: 'marko@fk.ba' }, payment: { status: 'PENDING_ONLINE' }, tickets: [],
  ...over,
});

beforeEach(() => {
  state.orders = { data: [], isLoading: false };
  state.canManage = true;
  state.confirm = vi.fn(async () => true);
  state.confirmPayment = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.confirmRefund = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.sheet = {} as typeof state.sheet;
});

describe('TicketingOrdersTab — akcije nad narudžbom', () => {
  it('klik na red otvara sheet sa narudžbom', async () => {
    const user = userEvent.setup();
    state.orders = { data: [order()], isLoading: false };
    render(<TicketingOrdersTab />);
    expect(screen.getByText('sheet:false:-:true')).toBeInTheDocument();
    await user.click(screen.getByTestId('row-ord1234567890'));
    expect(screen.getByText('sheet:true:ord1234567890:true')).toBeInTheDocument();
  });

  it('dugme Detalj otvara sheet bez oslanjanja na klik reda', async () => {
    const user = userEvent.setup();
    state.orders = { data: [order({ status: 'paid' })], isLoading: false };
    render(<TicketingOrdersTab />);
    await user.click(screen.getByRole('button', { name: 'Detalj' }));
    expect(screen.getByText('sheet:true:ord1234567890:true')).toBeInTheDocument();
  });

  it('potvrda uplate traži potvrdu pa šalje ID narudžbe', async () => {
    const user = userEvent.setup();
    state.orders = { data: [order()], isLoading: false };
    render(<TicketingOrdersTab />);
    await user.click(screen.getByRole('button', { name: 'Potvrdi uplatu' }));
    await waitFor(() => expect(state.confirmPayment.mutateAsync).toHaveBeenCalledWith('ord1234567890'));
    expect(state.confirm).toHaveBeenCalledWith({ title: 'Potvrditi uplatu?', confirmLabel: 'Potvrdi' });
  });

  it('blagajna na čekanju takođe dobija dugme za potvrdu uplate', () => {
    state.orders = { data: [order({ status: 'paid', payment: { status: 'PENDING_BOX_OFFICE' } })], isLoading: false };
    render(<TicketingOrdersTab />);
    expect(screen.getByRole('button', { name: 'Potvrdi uplatu' })).toBeInTheDocument();
  });

  it('odbijena potvrda ne mijenja narudžbu', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    state.orders = { data: [order()], isLoading: false };
    render(<TicketingOrdersTab />);
    await user.click(screen.getByRole('button', { name: 'Potvrdi uplatu' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.confirmPayment.mutateAsync).not.toHaveBeenCalled();
  });

  it('povrat se odobrava samo kad je zatražen, uz potvrdu', async () => {
    const user = userEvent.setup();
    state.orders = {
      data: [order({ id: 'o-ref', status: 'refund_requested' }), order({ id: 'o-pl', status: 'paid' })],
      isLoading: false,
    };
    render(<TicketingOrdersTab />);
    expect(screen.getAllByRole('button', { name: 'Odobri povrat' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Potvrdi uplatu' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Odobri povrat' }));
    await waitFor(() => expect(state.confirmRefund.mutateAsync).toHaveBeenCalledWith('o-ref'));
    expect(state.confirm).toHaveBeenCalledWith({ title: 'Odobriti povrat?', confirmLabel: 'Potvrdi' });
  });

  it('dugmad su onemogućena dok je akcija u toku', () => {
    state.confirmPayment = { ...state.confirmPayment, isPending: true };
    state.confirmRefund = { ...state.confirmRefund, isPending: true };
    state.orders = { data: [order({ status: 'pending' })], isLoading: false };
    render(<TicketingOrdersTab />);
    expect(screen.getByRole('button', { name: 'Potvrdi uplatu' })).toBeDisabled();
  });
});
