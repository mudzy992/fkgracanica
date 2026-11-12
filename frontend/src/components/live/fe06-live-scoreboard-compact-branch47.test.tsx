import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LiveScoreboardCompact } from './LiveScoreboardCompact';

vi.mock('../public/clubs/ClubCrest', () => ({
  ClubCrest: ({ club }: { club?: { name?: string } | null }) => <span>crest-{club?.name ?? 'none'}</span>,
}));

const base = (over: Record<string, unknown> = {}) =>
  ({
    id: 'm1',
    status: 'LIVE',
    homeClub: { name: 'FK Gračanica' },
    awayClub: { name: 'FK Slavija' },
    homeScore: 1,
    awayScore: 2,
    minute: 88,
    ...over,
  }) as never;

describe('LiveScoreboardCompact — branch47 (2 grane ?? fallback)', () => {
  it('penali bez skorova prikazuju 0:0 (pokriva ?? 0 fallback)', () => {
    render(<LiveScoreboardCompact match={base({ matchPeriod: 'PENALTIES', penaltyHomeScore: null, penaltyAwayScore: undefined }) as never} clock={null} onToggle={vi.fn()} />);
    expect(screen.getByText('PEN')).toBeInTheDocument();
    // oba ?? 0
    expect(screen.getByText('pen 0:0')).toBeInTheDocument();
  });

  it('penali sa jednim nul-skora i drugim definisanim pokrivaju miješani fallback', () => {
    const { unmount } = render(<LiveScoreboardCompact match={base({ matchPeriod: 'PENALTIES', penaltyHomeScore: 5, penaltyAwayScore: null }) as never} clock={null} onToggle={vi.fn()} />);
    expect(screen.getByText('pen 0:5')).toBeInTheDocument();
    unmount();
    render(<LiveScoreboardCompact match={base({ matchPeriod: 'PENALTIES', penaltyHomeScore: null, penaltyAwayScore: 3 }) as never} clock={null} onToggle={vi.fn()} />);
    expect(screen.getByText('pen 3:0')).toBeInTheDocument();
  });
});
