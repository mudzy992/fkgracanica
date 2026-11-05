import { vi } from 'vitest';
import type { Match } from '../../types';
import { AdminDataTableDouble, adminShellState } from './admin-shell-doubles';

/** Stanje i dvojnici za testove RoundMatchesPanel (tabela + akcije u dva fajla). */
export const roundMatchesState = {
  matches: undefined as Match[] | undefined,
  isLoading: false,
  perms: [] as string[],
  confirm: vi.fn(),
  remove: vi.fn(),
  form: {} as Record<string, unknown>,
  lineup: {} as Record<string, unknown>,
};

export function resetRoundMatchesState(matches: Match[] = [roundMatch()]) {
  roundMatchesState.matches = matches;
  roundMatchesState.isLoading = false;
  roundMatchesState.perms = ['live.manage'];
  roundMatchesState.confirm.mockReset();
  roundMatchesState.confirm.mockResolvedValue(true);
  roundMatchesState.remove.mockReset();
  roundMatchesState.remove.mockResolvedValue({});
  roundMatchesState.form = {};
  roundMatchesState.lineup = {};
  adminShellState.actions = null;
}

export function roundMatch(over: Partial<Match> = {}): Match {
  return {
    id: 'm1',
    status: 'SCHEDULED',
    scheduledAt: '2026-05-10T17:00:00.000Z',
    homeScore: null,
    awayScore: null,
    homeClub: { name: 'Domaći' },
    awayClub: { name: 'Gost' },
    ...over,
  } as Match;
}

export const formatDateTimeDouble = (value: string) => `dt:${value}`;

export function matchesHooksModule() {
  return {
    useMatches: (seasonId: string, roundId: string) => ({
      data: roundMatchesState.matches,
      isLoading: roundMatchesState.isLoading,
      seasonId,
      roundId,
    }),
  };
}

export function competitionAdminModule() {
  return { useDeleteMatch: () => ({ mutateAsync: roundMatchesState.remove }) };
}

export function confirmModule() {
  return { useConfirm: () => ({ confirm: roundMatchesState.confirm, dialog: null }) };
}

export function roundMatchesAuthModule() {
  return { useAuth: () => ({ user: { permissions: roundMatchesState.perms } }) };
}

export function roundMatchesSheetsModule() {
  return {
    MatchFormSheet: (props: Record<string, unknown>) => {
      roundMatchesState.form = props;
      const edit = props.edit as { id?: string } | null;
      return (
        <div>
          forma:{String(props.open)}:{String(edit?.id ?? '-')}
        </div>
      );
    },
    MatchLineupSheet: (props: Record<string, unknown>) => {
      roundMatchesState.lineup = props;
      return (
        <div>
          postava:{String(props.open)}:{String(props.matchId ?? '-')}
        </div>
      );
    },
  };
}

export function roundMatchesTableModule() {
  return { AdminDataTable: AdminDataTableDouble };
}
