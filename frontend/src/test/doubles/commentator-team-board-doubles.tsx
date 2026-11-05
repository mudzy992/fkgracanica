import { vi } from 'vitest';
import type { Match, MatchLineup } from '../../types';

/** Zajedničko stanje i dvojnici za CommentatorTeamColumn testove (dva fajla). */
export const boardState = {
  live: { mutateAsync: vi.fn((body: unknown) => Promise.resolve(body)), isPending: false },
  report: { mutateAsync: vi.fn((body: unknown) => Promise.resolve(body)), isPending: false },
};

export const boardLineup = (over: Partial<MatchLineup> = {}): MatchLineup =>
  ({
    clubId: 'c1',
    playerId: 'p1',
    isStarter: true,
    player: { id: 'p1', firstName: 'Ana', lastName: 'Anić', isActive: true },
    ...over,
  }) as MatchLineup;

export const boardMatch = (over: Partial<Match> = {}): Match =>
  ({
    id: 'm1',
    lineup: [
      boardLineup({}),
      boardLineup({
        playerId: 'p2',
        isStarter: false,
        player: { id: 'p2', firstName: 'Bora', lastName: 'Borić', isActive: true },
      }),
      boardLineup({
        clubId: 'c2',
        playerId: 'p9',
        player: { id: 'p9', firstName: 'Tuđi', lastName: 'Igrač', isActive: true },
      }),
      boardLineup({ playerId: 'p3', player: null }),
    ],
    ...over,
  }) as Match;

export function resetBoardState() {
  boardState.live.mutateAsync.mockClear();
  boardState.live.isPending = false;
  boardState.report.mutateAsync.mockClear();
  boardState.report.isPending = false;
}

export function liveAdminModule() {
  return { useAddMatchEvent: () => boardState.live };
}

export function liveReportModule() {
  return { useAddReportEvent: () => boardState.report };
}
