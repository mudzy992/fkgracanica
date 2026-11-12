import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MatchTicketsSummaryCard } from './MatchTicketsSummaryCard';

vi.mock('../../lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../lib/utils')>('../../lib/utils');
  return { ...actual, formatDateTime: (s: string) => `dt:${s}` };
});
vi.mock('../../lib/ticketing-status', () => ({ matchLabel: (m: unknown) => (m as { id?: string })?.id ?? 'Match' }));

function group(statuses: string[]) {
  return {
    match: { id: 'M1', scheduledAt: '2026-11-09T15:00:00Z' },
    items: statuses.map((status, i) => ({
      ticket: { status, matchId: 'M1', match: { id: 'M1', scheduledAt: '2026-11-09T15:00:00Z' } },
      order: { id: `o${i}` },
    })),
  };
}

describe('MatchTicketsSummaryCard — branch48 (2 plural grane)', () => {
  it('bez plaćenih i bez scheduledAt fallback', () => {
    const g = {
      match: { id: 'M2' },
      items: [{ ticket: { status: 'USED' }, order: { id: 'o1' } }],
    } as never;
    const { container } = render(<MatchTicketsSummaryCard group={g} onClick={vi.fn()} />);
    expect(container.textContent).toMatch(/zatvoren/);
    expect(container.textContent).not.toMatch(/dt:/);
  });

  it('reserved 2 i closed 2 pokriva plural e (bid4 [0,1] i bid6 [0,2])', () => {
    const g = group(['RESERVED', 'RESERVED', 'USED', 'USED']) as never;
    const onClick = vi.fn();
    render(<MatchTicketsSummaryCard group={g} onClick={onClick} />);
    // 2 rezervisane, 2 zatvorene
    expect(screen.getByText(/2 rezervisan/)).toBeInTheDocument();
    expect(screen.getByText(/2 zatvoren/)).toBeInTheDocument();
    // plural e
    expect(screen.getByText('2 rezervisane')).toBeInTheDocument();
    expect(screen.getByText('2 zatvorene')).toBeInTheDocument();
  });

  it('reserved 1 i closed 1 pokriva singular a', () => {
    const g = group(['RESERVED', 'USED']) as never;
    render(<MatchTicketsSummaryCard group={g} onClick={vi.fn()} />);
    expect(screen.getByText('1 rezervisana')).toBeInTheDocument();
    expect(screen.getByText('1 zatvorena')).toBeInTheDocument();
  });

  it('paid 2 i paid 1 singular/plural', () => {
    const g2 = group(['PAID_AT_BOX_OFFICE', 'PAID_AT_BOX_OFFICE']) as never;
    const { unmount } = render(<MatchTicketsSummaryCard group={g2} onClick={vi.fn()} />);
    expect(screen.getByText('2 plaćene')).toBeInTheDocument();
    unmount();
    const g1 = group(['PAID_AT_BOX_OFFICE']) as never;
    render(<MatchTicketsSummaryCard group={g1} onClick={vi.fn()} />);
    expect(screen.getByText('1 plaćena')).toBeInTheDocument();
  });

  it('onClick se poziva', () => {
    const g = group(['RESERVED']) as never;
    const fn = vi.fn();
    render(<MatchTicketsSummaryCard group={g} onClick={fn} />);
    screen.getByRole('button').click();
    expect(fn).toHaveBeenCalled();
  });
});
