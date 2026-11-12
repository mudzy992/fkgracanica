import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { MatchTicketsDialog } from './MatchTicketsDialog';

vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: { modulesTicketing: true } }),
}));
vi.mock('./TicketPassCard', () => ({
  TicketPassCard: ({ ticket, orderActions }: { ticket: { id: string }; orderActions?: React.ReactNode }) => (
    <div data-testid={`pass-${ticket.id}`}>
      {orderActions ? 'sa-akcijama' : 'bez-akcija'}
      {orderActions}
    </div>
  ),
}));
vi.mock('./TicketOrderActions', () => ({
  TicketOrderActions: ({ order }: { order: { id: string } }) => (
    <span data-testid={`order-${order.id}`}>akcije</span>
  ),
}));

const order = (id: string) => ({ id, status: 'PAID', totalAmount: 20 });
const ticket = (id: string) => ({ id, status: 'VALID', qrToken: 'tok' });

const group = (items: { id: string; orderId: string }[]) => ({
  matchId: 'm1',
  match: {
    id: 'm1',
    scheduledAt: '2026-05-01T17:00:00.000Z',
    homeClub: { name: 'FK Gračanica' },
    awayClub: { name: 'FK Slavija' },
  },
  items: items.map(({ id, orderId }) => ({
    ticket: ticket(id),
    order: order(orderId),
  })),
});

beforeAll(() => installDialogPolyfill());

describe('MatchTicketsDialog', () => {
  it('bez grupe ne renderira ništa', () => {
    const { container } = render(<MatchTicketsDialog group={null} open onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('zatvoren dijalog ne prikazuje sadržaj', () => {
    render(<MatchTicketsDialog group={group([]) as never} open={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/ulaznic/)).toBeNull();
  });

  it('prikazuje utakmicu, termin i broj ulaznica', () => {
    render(
      <MatchTicketsDialog
        group={group([{ id: 't1', orderId: 'o1' }]) as never}
        open
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('FK Gračanica vs FK Slavija')).toBeInTheDocument();
    expect(screen.getByText('1 ulaznica za ovu utakmicu')).toBeInTheDocument();
  });

  it('množina koristi drugi oblik', () => {
    render(
      <MatchTicketsDialog
        group={
          group([
            { id: 't1', orderId: 'o1' },
            { id: 't2', orderId: 'o1' },
          ]) as never
        }
        open
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('2 ulaznice za ovu utakmicu')).toBeInTheDocument();
  });

  it('akcije narudžbe prikazuju se samo na prvoj ulaznici iste narudžbe', () => {
    render(
      <MatchTicketsDialog
        group={
          group([
            { id: 't1', orderId: 'o1' },
            { id: 't2', orderId: 'o1' },
            { id: 't3', orderId: 'o2' },
          ]) as never
        }
        open
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId('pass-t1')).toHaveTextContent('sa-akcijama');
    expect(screen.getByTestId('pass-t2')).toHaveTextContent('bez-akcija');
    expect(screen.getByTestId('pass-t3')).toHaveTextContent('sa-akcijama');
    expect(document.querySelectorAll('[data-testid^="order-"]')).toHaveLength(2);
  });

  it('bez termina utakmice ne prikazuje datum', () => {
    const g = group([{ id: 't1', orderId: 'o1' }]);
    const { container } = render(
      <MatchTicketsDialog
        group={{ ...g, match: { id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } } } as never}
        open
        onClose={vi.fn()}
      />,
    );
    expect(container.textContent).not.toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
  });
});

describe('MatchTicketsDialog — zatvaranje', () => {
  it('X u zaglavlju i klik na pozadinu zovu onClose', () => {
    const onClose = vi.fn();
    render(<MatchTicketsDialog group={group([{ id: 't1', orderId: 'o1' }]) as never} open onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(screen.getAllByRole('button', { name: 'actions.close' }).find((b) => !b.className.includes('inset-0'))!);
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
