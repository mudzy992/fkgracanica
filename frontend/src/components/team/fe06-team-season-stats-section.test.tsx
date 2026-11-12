import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  PublicPill: ({ children, active, onClick }: {
    children: React.ReactNode; active: boolean; onClick: () => void;
  }) => (
    <button aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock('./TeamSeasonStats', () => ({
  TeamSeasonStats: ({ stats }: { stats?: { seasonName?: string } }) => (
    <div>statistika:{stats?.seasonName ?? 'nema'}</div>
  ),
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

const renderSection = () => render(<TeamSeasonStatsSection clubId="club-1" />);

beforeEach(() => {
  state.participations = [p()];
  state.stats = { seasonName: '2025/26' };
  state.statsLoading = false;
  state.statsCalls = [];
});

describe('TeamSeasonStatsSection — učitavanje i selekcija', () => {
  it('dok statistika nema podataka prikazuje skeleton', () => {
    state.stats = undefined;
    state.statsLoading = true;
    renderSection();
    expect(screen.getByText('skeleton')).toBeInTheDocument();
  });

  it('sa jednom sezonom nema pilula i traži statistiku te sezone', async () => {
    renderSection();
    expect(screen.queryByRole('button', { name: '2025/26' })).toBeNull();
    await waitFor(() =>
      expect(state.statsCalls.at(-1)).toEqual(['club-1', 's1']),
    );
    expect(screen.getByText('statistika:2025/26')).toBeInTheDocument();
  });

  it('bez participacija ne traži sezonu i prikazuje praznu statistiku', async () => {
    state.participations = [];
    state.stats = undefined;
    renderSection();
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', undefined]));
    expect(screen.getByText('statistika:nema')).toBeInTheDocument();
  });

  it('više kalendarskih sezona daje pilule, aktivna liga je podrazumijevana', async () => {
    state.participations = [
      p({ seasonId: 's2024', seasonName: '2024/25', yearStart: 2024, yearEnd: 2025, isActive: false }),
      p({ seasonId: 's2025', seasonName: '2025/26', yearStart: 2025, yearEnd: 2026 }),
    ];
    renderSection();
    expect(screen.getByRole('button', { name: '2025/26' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '2024/25' })).toHaveAttribute('aria-pressed', 'false');
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', 's2025']));
  });

  it('klik na stariju sezonu mijenja upit', async () => {
    const user = userEvent.setup();
    state.participations = [
      p({ seasonId: 's2024', seasonName: '2024/25', yearStart: 2024, yearEnd: 2025, isActive: false }),
      p({ seasonId: 's2025', seasonName: '2025/26', yearStart: 2025, yearEnd: 2026 }),
    ];
    renderSection();
    await user.click(screen.getByRole('button', { name: '2024/25' }));
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', 's2024']));
  });
});

describe('TeamSeasonStatsSection — više takmičenja u sezoni', () => {
  it('prikazuje pilule po takmičenju, liga prva i sa oznakom', async () => {
    state.participations = [
      p({ seasonId: 'kup', competitionId: 'c2', competitionName: 'Kup', isLeague: false }),
      p({ seasonId: 'liga', competitionId: 'c1', competitionName: 'Kantonalna liga', isLeague: true }),
    ];
    renderSection();
    const pills = screen.getAllByRole('button').filter((b) => /Kup|liga/.test(b.textContent ?? ''));
    expect(pills.map((b) => b.textContent)).toEqual(['Kantonalna liga · liga', 'Kup']);
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', 'liga']));
  });

  it('izbor kupa mijenja sezonu upita', async () => {
    const user = userEvent.setup();
    state.participations = [
      p({ seasonId: 'liga', isLeague: true }),
      p({ seasonId: 'kup', competitionId: 'c2', competitionName: 'Kup', isLeague: false }),
    ];
    renderSection();
    await user.click(screen.getByRole('button', { name: 'Kup' }));
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', 'kup']));
  });

  it('zadržava izabrano takmičenje kad stignu novi podaci iste sezone', async () => {
    const user = userEvent.setup();
    state.participations = [
      p({ seasonId: 'liga', isLeague: true }),
      p({ seasonId: 'kup', competitionId: 'c2', competitionName: 'Kup', isLeague: false }),
    ];
    const { rerender } = renderSection();
    await user.click(screen.getByRole('button', { name: 'Kup' }));
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', 'kup']));
    rerender(<TeamSeasonStatsSection clubId="club-1" />);
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', 'kup']));
  });
});

describe('TeamSeasonStatsSection — osvježeni podaci', () => {
  it('zadržava odabranu godinu kad se participacije ponovo učitaju', async () => {
    const list = () => [
      p({ seasonId: 's2024', seasonName: '2024/25', yearStart: 2024, yearEnd: 2025, isActive: false }),
      p({ seasonId: 's2025', seasonName: '2025/26', yearStart: 2025, yearEnd: 2026 }),
    ];
    state.participations = list();
    const { rerender } = renderSection();
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', 's2025']));
    state.participations = list();
    rerender(<TeamSeasonStatsSection clubId="club-1" />);
    await waitFor(() => expect(state.statsCalls.at(-1)).toEqual(['club-1', 's2025']));
    expect(screen.getByRole('button', { name: '2025/26' })).toHaveAttribute('aria-pressed', 'true');
  });
});
