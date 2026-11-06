import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketOrderActions } from './TicketOrderActions';

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

describe('TicketOrderActions', () => {
  beforeEach(() => {
    state.refund = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.cancel = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.checkout = {
      mutateAsync: vi.fn(async () => ({ url: undefined as string | undefined })),
      isPending: false,
    };
  });

  it('otkazana narudžba bez provajdera nema nijednu akciju', () => {
    const { container } = render(
      <TicketOrderActions order={order({ status: 'cancelled' })} config={undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prazna lista ulaznica i dalje dopušta otkazivanje rezervacije', () => {
    render(<TicketOrderActions order={order({ tickets: [] })} config={undefined} />);
    expect(screen.getByRole('button', { name: 'Otkaži rezervaciju' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Plati online/ })).toBeNull();
  });

  it('rezervisana narudžba nudi plaćanje online i otkazivanje', () => {
    render(<TicketOrderActions order={order()} config={config as never} />);
    expect(screen.getByRole('button', { name: /Plati online/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Otkaži rezervaciju' })).toBeTruthy();
    expect(screen.getByText('Narudžba · 30 KM')).toBeTruthy();
    expect(screen.getByText('Na čekanju')).toBeTruthy();
  });

  it('plaćanje online šalje orderId i providera', async () => {
    render(<TicketOrderActions order={order()} config={config as never} />);
    await userEvent.click(screen.getByRole('button', { name: /Plati online/ }));
    expect(state.checkout.mutateAsync).toHaveBeenCalledWith({ orderId: 'o1', provider: 'stripe' });
  });

  it('otkazivanje šalje ID narudžbe', async () => {
    render(<TicketOrderActions order={order()} config={config as never} />);
    await userEvent.click(screen.getByRole('button', { name: 'Otkaži rezervaciju' }));
    expect(state.cancel.mutateAsync).toHaveBeenCalledWith('o1');
  });

  it('bez provajdera nema plaćanja online, ali otkazivanje ostaje', () => {
    render(<TicketOrderActions order={order()} config={undefined} />);
    expect(screen.queryByRole('button', { name: /Plati online/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Otkaži rezervaciju' })).toBeTruthy();
  });

  it('plaćena narudžba nudi povrat, bez otkazivanja', () => {
    render(<TicketOrderActions order={order({ status: 'paid' })} config={config as never} />);
    expect(screen.getByRole('button', { name: 'Zatraži povrat' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Otkaži rezervaciju' })).toBeNull();
    expect(screen.getByText('Plaćeno')).toBeTruthy();
  });

  it('povrat šalje ID narudžbe', async () => {
    render(<TicketOrderActions order={order({ status: 'paid' })} config={config as never} />);
    await userEvent.click(screen.getByRole('button', { name: 'Zatraži povrat' }));
    expect(state.refund.mutateAsync).toHaveBeenCalledWith('o1');
  });

  it('narudžba sa ulaznicom plaćenom na blagajni ne može se otkazati', () => {
    render(
      <TicketOrderActions
        order={order({ tickets: [{ id: 't1', status: 'PAID_AT_BOX_OFFICE' }] })}
        config={undefined}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Otkaži rezervaciju' })).toBeNull();
  });

  it('tokom otkazivanja dugme je onemogućeno', () => {
    state.cancel = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<TicketOrderActions order={order()} config={undefined} />);
    expect(screen.getByRole('button', { name: 'Otkaži rezervaciju' })).toHaveProperty('disabled', true);
  });

  it('tokom povrata dugme je onemogućeno', () => {
    state.refund = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<TicketOrderActions order={order({ status: 'paid' })} config={undefined} />);
    expect(screen.getByRole('button', { name: 'Zatraži povrat' })).toHaveProperty('disabled', true);
  });

  it('više provajdera daje dugmad sa aria-labelom', () => {
    render(
      <TicketOrderActions
        order={order()}
        config={{ readyProviders: ['stripe', 'paypal'] } as never}
      />,
    );
    expect(screen.getByRole('button', { name: 'Plati putem Stripe' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Plati putem PayPal' })).toBeTruthy();
  });
});
