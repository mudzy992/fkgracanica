import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketingOrderSheet } from './TicketingOrderSheet';

const state = vi.hoisted(() => ({
  detail: undefined as unknown,
  confirmPayment: vi.fn(),
  confirmRefund: vi.fn(),
  cancelOrder: vi.fn(),
  confirmAnswer: true,
  confirmCalls: [] as unknown[],
  pending: { payment: false, refund: false, cancel: false },
  sheet: {} as Record<string, unknown>,
  closed: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/utils', () => ({
  formatDateTime: (value: string) => `dt:${value}`,
  cn: (...values: Array<string | undefined>) => values.filter(Boolean).join(' '),
}));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({
    confirm: (options: unknown) => {
      state.confirmCalls.push(options);
      return Promise.resolve(state.confirmAnswer);
    },
    dialog: <div>confirm-dijalog</div>,
  }),
}));
vi.mock('../../hooks/use-ticketing-admin', () => ({
  useTicketingOrderDetail: (id?: string) => ({ data: id ? state.detail : undefined }),
  useConfirmTicketingPayment: () => ({
    mutateAsync: state.confirmPayment,
    isPending: state.pending.payment,
  }),
  useConfirmTicketingRefund: () => ({
    mutateAsync: state.confirmRefund,
    isPending: state.pending.refund,
  }),
  useAdminCancelTicketingOrder: () => ({
    mutateAsync: state.cancelOrder,
    isPending: state.pending.cancel,
  }),
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ title, children }: { title: string; children: React.ReactNode }) => {
    state.sheet = { title };
    return (
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    );
  },
}));
vi.mock('../../components/membership/MembershipQrCode', () => ({
  MembershipQrCode: (props: Record<string, unknown>) => <div>qr:{String(props.value)}</div>,
}));

const ticket = (over: Record<string, unknown> = {}) => ({
  id: 't1',
  category: 'Tribina',
  price: 10,
  status: 'PAID_AT_BOX_OFFICE',
  qrCode: 'QR-1',
  match: { homeClub: { name: 'Gračanica' }, awayClub: { name: 'Zenica' } },
  ...over,
});

const order = (over: Record<string, unknown> = {}) => ({
  id: 'order123456789',
  status: 'pending',
  total: 20,
  createdAt: '2026-05-01T10:00:00Z',
  user: { email: 'kupac@mail.ba' },
  tickets: [ticket()],
  ...over,
});

const renderSheet = (over: Record<string, unknown> = {}) =>
  render(
    <TicketingOrderSheet
      order={order() as never}
      open
      onOpenChange={(open: boolean) => state.closed.push(open)}
      canManage
      {...(over as object)}
    />,
  );

const click = (name: string) => userEvent.setup().click(screen.getByRole('button', { name }));

beforeEach(() => {
  state.detail = undefined;
  state.confirmPayment.mockReset().mockResolvedValue(undefined);
  state.confirmRefund.mockReset().mockResolvedValue(undefined);
  state.cancelOrder.mockReset().mockResolvedValue(undefined);
  state.confirmAnswer = true;
  state.confirmCalls = [];
  state.pending = { payment: false, refund: false, cancel: false };
  state.sheet = {};
  state.closed = [];
});

describe('TicketingOrderSheet — akcije', () => {
  it('potvrđuje uplatu nakon potvrde dijaloga', async () => {
    renderSheet();
    await click('Potvrdi uplatu');
    expect(state.confirmCalls[0]).toMatchObject({ confirmLabel: 'Potvrdi' });
    expect(state.confirmPayment).toHaveBeenCalledWith('order123456789');
  });

  it('ne izvršava akciju kad potvrda bude odbijena', async () => {
    state.confirmAnswer = false;
    renderSheet();
    await click('Potvrdi uplatu');
    expect(state.confirmPayment).not.toHaveBeenCalled();
  });

  it('odobrava povrat za refund_requested', async () => {
    renderSheet({ order: order({ status: 'refund_requested' }) });
    await click('Odobri povrat');
    expect(state.confirmRefund).toHaveBeenCalledWith('order123456789');
  });

  it('otkazivanje zatvara sheet nakon uspjeha', async () => {
    renderSheet();
    await click('Otkaži narudžbu');
    expect(state.cancelOrder).toHaveBeenCalledWith('order123456789');
    expect(state.closed).toEqual([false]);
  });

  it('bez canManage nema akcionih dugmadi', () => {
    renderSheet({ canManage: false });
    expect(screen.queryByRole('button', { name: 'Potvrdi uplatu' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Otkaži narudžbu' })).toBeNull();
  });

  it('završena narudžba nema dugme za otkazivanje', () => {
    renderSheet({ order: order({ status: 'refunded' }) });
    expect(screen.queryByRole('button', { name: 'Otkaži narudžbu' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Potvrdi uplatu' })).toBeNull();
  });

  it('dok je akcija u toku dugme je onemogućeno', () => {
    state.pending = { payment: true, refund: true, cancel: true };
    renderSheet();
    expect(screen.getByRole('button', { name: 'Potvrdi uplatu' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Otkaži narudžbu' })).toBeDisabled();
  });

  it('renderuje confirm dijalog', () => {
    renderSheet();
    expect(screen.getByText('confirm-dijalog')).toBeInTheDocument();
  });
});
