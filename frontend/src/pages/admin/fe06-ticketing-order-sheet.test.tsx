import { render, screen } from '@testing-library/react';
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
  qr: [] as Array<Record<string, unknown>>,
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
  MembershipQrCode: (props: Record<string, unknown>) => {
    state.qr.push(props);
    return <div>qr:{String(props.value)}</div>;
  },
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

beforeEach(() => {
  state.detail = undefined;
  state.confirmPayment.mockReset().mockResolvedValue(undefined);
  state.confirmRefund.mockReset().mockResolvedValue(undefined);
  state.cancelOrder.mockReset().mockResolvedValue(undefined);
  state.confirmAnswer = true;
  state.confirmCalls = [];
  state.pending = { payment: false, refund: false, cancel: false };
  state.sheet = {};
  state.qr = [];
  state.closed = [];
});

describe('TicketingOrderSheet — detalji', () => {
  it('bez narudžbe ne prikazuje ništa', () => {
    const { container } = render(
      <TicketingOrderSheet order={null} open onOpenChange={vi.fn()} canManage />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje zaglavlje, kupca, status, iznos i datum', () => {
    renderSheet();
    expect(screen.getByRole('heading', { name: 'admin.orderSheet.title' })).toBeInTheDocument();
    expect(screen.getByText('kupac@mail.ba')).toBeInTheDocument();
    expect(screen.getByText('Na čekanju')).toBeInTheDocument();
    expect(screen.getByText('20 KM')).toBeInTheDocument();
    expect(screen.getByText('dt:2026-05-01T10:00:00Z')).toBeInTheDocument();
  });

  it('koristi detalj narudžbe kad je dostupan', () => {
    state.detail = order({ status: 'paid', total: 99, user: { email: 'detalj@mail.ba' } });
    renderSheet();
    expect(screen.getByText('detalj@mail.ba')).toBeInTheDocument();
    expect(screen.getByText('99 KM')).toBeInTheDocument();
    expect(screen.getAllByText('Plaćeno').length).toBeGreaterThanOrEqual(1);
  });

  it('bez korisnika i datuma preskače ta polja', () => {
    renderSheet({ order: order({ user: undefined, createdAt: null, tickets: [] }) });
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/dt:/)).toBeNull();
    expect(screen.queryByText(/Ulaznice/)).toBeNull();
  });

  it('prikazuje status plaćanja kad postoji uplata', () => {
    renderSheet({ order: order({ payment: { status: 'PENDING_BOX_OFFICE' } }) });
    expect(screen.getByText('admin.orderSheet.payment')).toBeInTheDocument();
    expect(screen.getByText('Čeka blagajnu')).toBeInTheDocument();
  });
});

describe('TicketingOrderSheet — ulaznice i QR', () => {
  it('prikazuje ulaznice sa QR kodom za plaćene', () => {
    renderSheet();
    expect(screen.getByText('Ulaznice (1)')).toBeInTheDocument();
    expect(screen.getByText('Gračanica vs Zenica')).toBeInTheDocument();
    expect(screen.getByText('Tribina · 10 KM')).toBeInTheDocument();
    expect(screen.getByText('qr:QR-1')).toBeInTheDocument();
    expect(state.qr[0]).toMatchObject({ value: 'QR-1', size: 120 });
  });

  it('rezervisana ulaznica nema QR kod', () => {
    renderSheet({ order: order({ tickets: [ticket({ status: 'RESERVED' })] }) });
    expect(screen.getByText('Rezervisano')).toBeInTheDocument();
    expect(screen.queryByText(/qr:/)).toBeNull();
  });

  it('utakmica bez klubova prikazuje crticu', () => {
    renderSheet({ order: order({ tickets: [ticket({ match: undefined })] }) });
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
