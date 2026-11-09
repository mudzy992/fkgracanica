import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TeamSeasonStatsSection } from './TeamSeasonStatsSection';

const state = vi.hoisted(() => ({
  participations: undefined as unknown,
  stats: undefined as unknown,
  statsLoading: false,
  statsCalls: [] as Array<[string, string | undefined]>,
}));

vi.mock('../../hooks/use-club-hub', () => ({
  useClubParticipations: () => ({ data: state.participations }),
  useClubStats: (clubId: string, seasonId?: string) => {
    state.statsCalls.push([clubId, seasonId]);
    return { data: state.stats, isLoading: state.statsLoading };
  },
}));
vi.mock('../ui/skeleton', () => ({ Skeleton: () => <div>skeleton</div> }));
vi.mock('../public/PublicPill', () => ({
  PublicPill: ({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) => (
    <button aria-pressed={active} onClick={onClick}>{children}</button>
  ),
}));
vi.mock('./TeamSeasonStats', () => ({
  TeamSeasonStats: ({ stats }: { stats?: { seasonName?: string } }) => <div>statistika:{stats?.seasonName ?? 'nema'}</div>,
}));

const p = (over: Record<string, unknown> = {}) => ({
  seasonId: 's1',
  seasonName: '2025/26',
  yearStart: 2025,
  yearEnd: 2026,
  isActive: true,
  competitionId: 'c1',
  competitionName: 'Kantonalna liga',
  isLeague: true,
  ...over,
});

beforeEach(() => {
  state.stats = { seasonName: '2025/26' };
  state.statsLoading = false;
  state.statsCalls = [];
});

describe('TeamSeasonStatsSection — branch47 (2 grane ?? i || fallback)', () => {
  it('participations ?? [] fallback kada je undefined ne puca i prikazuje praznu statistiku', async () => {
    // @ts-expect-error undefined test
    state.participations = undefined;
    state.stats = undefined;
    render(<TeamSeasonStatsSection clubId="club-1" />);
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', undefined]));
    expect(screen.getByText('statistika:nema')).toBeInTheDocument();
  });

  it('oba takmičenja iste lige koriste localeCompare fallback (league || ...)', async () => {
    // oba isLeague = true => league =0 => fallback localeCompare
    // trebaju imati istu godinu da budu u istom inYear
    state.participations = [
      p({ seasonId: 'a', competitionId: 'c1', competitionName: 'Alpha', isLeague: false }),
      p({ seasonId: 'b', competitionId: 'c2', competitionName: 'Beta', isLeague: false }),
    ];
    render(<TeamSeasonStatsSection clubId="club-1" />);
    // trebaju biti sortirani po imenu (Alpha, Beta) jer league 0
    const pills = screen.getAllByRole('button').filter((b) => /Alpha|Beta/.test(b.textContent ?? ''));
    expect(pills.map((b) => b.textContent)).toEqual(['Alpha', 'Beta']);
  });

  it('miješani isLeague koristi league rang bez fallback', async () => {
    state.participations = [
      p({ seasonId: 'kup', competitionId: 'c2', competitionName: 'Kup', isLeague: false }),
      p({ seasonId: 'liga', competitionId: 'c1', competitionName: 'Kantonalna liga', isLeague: true }),
    ];
    render(<TeamSeasonStatsSection clubId="club-1" />);
    const pills = screen.getAllByRole('button').filter((b) => /Kup|liga/.test(b.textContent ?? ''));
    expect(pills[0].textContent).toContain('Kantonalna liga');
  });
});
