import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketOrderCard } from './TicketOrderCard';

const state = vi.hoisted(() => ({
  config: { data: undefined as unknown },
  refund: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  cancel: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  checkout: { mutateAsync: vi.fn(async () => ({ url: undefined as string | undefined })), isPending: false },
}));

vi.mock('../../hooks/use-ticketing', () => ({
  useRequestTicketRefund: () => state.refund,
  useCancelMyTicketOrder: () => state.cancel,
  useTicketingPublicConfig: () => state.config,
}));
vi.mock('../../hooks/use-online-checkout', () => ({ useOnlineTicketCheckout: () => state.checkout }));
vi.mock('./TicketPassCard', () => ({
  TicketPassCard: ({ ticket }: { ticket: { id: string } }) => (
    <div data-testid={`pass-${ticket.id}`} />
  ),
}));

const order = (over: Record<string, unknown> = {}) =>
  ({
    id: 'o1',
    status: 'pending',
    total: 30,
    createdAt: '2026-05-01T10:00:00.000Z',
    payment: null,
    tickets: [{ id: 't1', status: 'RESERVED' }],
    ...over,
  }) as never;

const config = { readyProviders: ['stripe'] };

describe('TicketOrderCard', () => {
  beforeEach(() => {
    state.config = { data: undefined };
    state.refund = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.cancel = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.checkout = {
      mutateAsync: vi.fn(async () => ({ url: undefined as string | undefined })),
      isPending: false,
    };
  });

  it('prikazuje datum, iznos, status i ulaznice', () => {
    state.config = { data: config };
    render(<TicketOrderCard order={order({ tickets: [{ id: 't1', status: 'RESERVED' }, { id: 't2', status: 'RESERVED' }] })} />);
    expect(screen.getByText(/Narudžba · .* · 30 KM/)).toBeTruthy();
    expect(screen.getByText('Na čekanju')).toBeTruthy();
    expect(screen.getByTestId('pass-t1')).toBeTruthy();
    expect(screen.getByTestId('pass-t2')).toBeTruthy();
  });

  it('bez datuma prikazuje crticu', () => {
    state.config = { data: config };
    render(<TicketOrderCard order={order({ createdAt: null })} />);
    expect(screen.getByText(/Narudžba · — · 30 KM/)).toBeTruthy();
  });

  it('pending sa online uplatom prikazuje napomenu', () => {
    state.config = { data: config };
    render(<TicketOrderCard order={order({ payment: { status: 'PENDING_ONLINE' } })} />);
    expect(screen.getByText('Online uplata u toku ili nije završena')).toBeTruthy();
  });

  it('bez online uplate nema napomene', () => {
    state.config = { data: config };
    render(<TicketOrderCard order={order()} />);
    expect(screen.queryByText('Online uplata u toku ili nije završena')).toBeNull();
  });

  it('plaćanje preusmjerava kada vrati URL', async () => {
    state.config = { data: config };
    state.checkout = {
      mutateAsync: vi.fn(async () => ({ url: 'https://pay.example/x' })),
      isPending: false,
    };
    const original = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...original, href: original.href },
    });
    render(<TicketOrderCard order={order()} />);
    await userEvent.click(screen.getByRole('button', { name: /Plati online/ }));
    expect(window.location.href).toBe('https://pay.example/x');
    Object.defineProperty(window, 'location', { writable: true, value: original });
  });

  it('plaćena narudžba nudi povrat i nema otkazivanja', async () => {
    const user = userEvent.setup();
    state.config = { data: config };
    render(<TicketOrderCard order={order({ status: 'paid' })} />);
    await user.click(screen.getByRole('button', { name: 'Zatraži povrat' }));
    expect(state.refund.mutateAsync).toHaveBeenCalledWith('o1');
    expect(screen.queryByRole('button', { name: 'Otkaži rezervaciju' })).toBeNull();
    expect(screen.getByText('Plaćeno')).toBeTruthy();
  });

  it('narudžba sa QR ulaznicom ne može se otkazati', () => {
    state.config = { data: config };
    render(
      <TicketOrderCard
        order={order({ tickets: [{ id: 't1', status: 'PAID_AT_BOX_OFFICE' }] })}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Otkaži rezervaciju' })).toBeNull();
  });

  it('preuzimanje i otkazivanje rade preko hookova', async () => {
    state.config = { data: config };
    render(<TicketOrderCard order={order()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Otkaži rezervaciju' }));
    expect(state.cancel.mutateAsync).toHaveBeenCalledWith('o1');
  });
});
