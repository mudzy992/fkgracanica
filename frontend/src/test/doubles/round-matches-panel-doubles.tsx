import { vi } from 'vitest';
import type { Match } from '../../types';
import { AdminDataTableDouble, adminShellState } from './admin-shell-doubles';

/** Stanje i dvojnici za testove RoundMatchesPanel (tabela + akcije u dva fajla). */
export const roundMatchesState = {
  matches: undefined as Match[] | undefined,
  isLoading: false,
  isError: false,
  isFetching: false,
  refetch: vi.fn(),
  perms: [] as string[],
  confirm: vi.fn(),
  remove: vi.fn() as unknown as ReturnType<typeof vi.fn> & { isPending?: boolean },
  removePending: false,
  form: {} as Record<string, unknown>,
  lineup: {} as Record<string, unknown>,
};

export function resetRoundMatchesState(matches: Match[] = [roundMatch()]) {
  roundMatchesState.matches = matches;
  roundMatchesState.isLoading = false;
  roundMatchesState.isError = false;
  roundMatchesState.isFetching = false;
  roundMatchesState.refetch = vi.fn();
  roundMatchesState.perms = ['live.manage'];
  roundMatchesState.confirm.mockReset();
  roundMatchesState.confirm.mockResolvedValue(true);
  roundMatchesState.remove.mockReset();
  roundMatchesState.remove.mockResolvedValue({});
  (roundMatchesState.remove as unknown as Record<string, unknown>).isPending = false;
  roundMatchesState.removePending = false;
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
      isError: roundMatchesState.isError,
      isFetching: roundMatchesState.isFetching,
      refetch: roundMatchesState.refetch,
      seasonId,
      roundId,
    }),
  };
}

export function competitionAdminModule() {
  return {
    useDeleteMatch: () => ({
      mutateAsync: roundMatchesState.remove,
      isPending: (roundMatchesState.remove as unknown as Record<string, unknown>).isPending ?? roundMatchesState.removePending,
    }),
  };
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
      const close = props.onOpenChange as (open: boolean) => void;
      return (
        <div>
          forma:{String(props.open)}:{String(edit?.id ?? '-')}
          {props.open ? <button onClick={() => close(false)}>zatvori-formu</button> : null}
        </div>
      );
    },
    MatchLineupSheet: (props: Record<string, unknown>) => {
      roundMatchesState.lineup = props;
      const close = props.onOpenChange as (open: boolean) => void;
      return (
        <div>
          postava:{String(props.open)}:{String(props.matchId ?? '-')}
          {props.open ? <button onClick={() => close(false)}>zatvori-postavu</button> : null}
        </div>
      );
    },
  };
}

export function roundMatchesTableModule() {
  return { AdminDataTable: AdminDataTableDouble };
}
