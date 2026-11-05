import { render, screen, within } from '@testing-library/react';
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
  id: 'ord1234567890',
  status: 'pending',
  total: 40,
  createdAt: '2026-05-01T18:00:00.000Z',
  user: { email: 'marko@fk.ba' },
  payment: { status: 'PENDING_ONLINE' },
  tickets: [{ match: { homeClub: { name: 'FK Graca' }, awayClub: { name: 'FK Rival' }, scheduledAt: '2026-05-02T17:00:00.000Z' } }],
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

describe('TicketingOrdersTab — tabela i filteri', () => {
  it('dok se narudžbe učitavaju prikazuje poruku, bez tabele', () => {
    state.orders = { data: [], isLoading: true };
    render(<TicketingOrdersTab />);
    expect(screen.getByText('admin.common.loading')).toBeInTheDocument();
    expect(screen.queryByText('Nema narudžbi.')).toBeNull();
  });

  it('prazna lista prikazuje poruku i panel za validaciju', () => {
    render(<TicketingOrdersTab />);
    expect(screen.getByText('Nema narudžbi.')).toBeInTheDocument();
    expect(screen.getByText('validate-panel')).toBeInTheDocument();
  });

  it('red prikazuje skraćeni ID, korisnika, utakmicu, status i iznos', () => {
    state.orders = { data: [order()], isLoading: false };
    render(<TicketingOrdersTab />);
    const row = screen.getByTestId('row-ord1234567890');
    expect(within(row).getByText('ord12345')).toBeInTheDocument();
    expect(within(row).getByText('marko@fk.ba')).toBeInTheDocument();
    expect(within(row).getByText(/FK Graca/)).toBeInTheDocument();
    expect(within(row).getByText('Na čekanju')).toBeInTheDocument();
    expect(within(row).getByText('40 KM')).toBeInTheDocument();
  });

  it('nedostajući podaci se prikazuju kao crtice', () => {
    state.orders = { data: [order({ user: null, tickets: [], createdAt: null })], isLoading: false };
    render(<TicketingOrdersTab />);
    expect(within(screen.getByTestId('row-ord1234567890')).getAllByText('—')).toHaveLength(3);
  });

  it('filteri sužavaju listu po statusu, uključujući blagajnu na čekanju', async () => {
    const user = userEvent.setup();
    state.orders = {
      data: [
        order({ id: 'o-pending', status: 'pending' }),
        order({ id: 'o-box', status: 'pending', payment: { status: 'PENDING_BOX_OFFICE' } }),
        order({ id: 'o-paid', status: 'paid' }),
        order({ id: 'o-refund', status: 'refund_requested' }),
        order({ id: 'o-cancelled', status: 'cancelled' }),
        order({ id: 'o-refunded', status: 'refunded' }),
      ],
      isLoading: false,
    };
    render(<TicketingOrdersTab />);
    const ids = () => screen.getAllByTestId(/^row-/).map((r) => r.dataset.testid);
    expect(ids()).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: 'Na čekanju' }));
    expect(ids()).toEqual(['row-o-pending', 'row-o-box']);
    await user.click(screen.getByRole('button', { name: 'Plaćeno' }));
    expect(ids()).toEqual(['row-o-paid']);
    await user.click(screen.getByRole('button', { name: 'Povrati' }));
    expect(ids()).toEqual(['row-o-refund']);
    await user.click(screen.getByRole('button', { name: 'Zatvoreno' }));
    expect(ids()).toEqual(['row-o-cancelled', 'row-o-refunded']);
    await user.click(screen.getByRole('button', { name: 'Sve' }));
    expect(ids()).toHaveLength(6);
  });

  it('bez dozvole upravljanja nema panela ni akcija', () => {
    state.canManage = false;
    state.orders = { data: [order()], isLoading: false };
    render(<TicketingOrdersTab />);
    expect(screen.queryByText('validate-panel')).toBeNull();
    const row = screen.getByTestId('row-ord1234567890');
    expect(within(row).getByText('—')).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: 'Detalj' })).toBeNull();
  });
});
