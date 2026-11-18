import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeasonRoundsPanel } from './SeasonRoundsPanel';
import { RoundMatchesPanel } from './RoundMatchesPanel';
import { seasonRoundsState as sState } from '../../../test/doubles/season-rounds-doubles';
import { roundMatchesState as mState, resetRoundMatchesState, roundMatch } from '../../../test/doubles/round-matches-panel-doubles';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/api', () => ({ api: { get: (url: string) => sState.apiGet(url) } }));
vi.mock('../../../hooks/use-rounds', () => ({ useRounds: () => sState.rounds, useDeleteRound: () => sState.remove }));
vi.mock('../../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: sState.confirm, dialog: null }) }));
vi.mock('./RoundFormSheet', async () => ({ RoundFormSheet: (await import('../../../test/doubles/season-rounds-doubles')).RoundFormSheetDouble }));
vi.mock('./RoundCascadeDeleteDialog', async () => ({ RoundCascadeDeleteDialog: (await import('../../../test/doubles/season-rounds-doubles')).RoundCascadeDeleteDialogDouble }));
vi.mock('../../../hooks', async () => (await import('../../../test/doubles/round-matches-panel-doubles')).matchesHooksModule());
vi.mock('../../../hooks/use-competition-admin', async () => (await import('../../../test/doubles/round-matches-panel-doubles')).competitionAdminModule());
vi.mock('../../../lib/auth', async () => (await import('../../../test/doubles/round-matches-panel-doubles')).roundMatchesAuthModule());
vi.mock('../../../lib/utils', async (orig) => ({ ...(await orig()), formatDateTime: (await import('../../../test/doubles/round-matches-panel-doubles')).formatDateTimeDouble }));
vi.mock('../../../lib/match-status-label', () => ({ matchStatusLabel: (s: string) => `status:${s}` }));
vi.mock('./MatchFormSheet', async () => ({ MatchFormSheet: (await import('../../../test/doubles/round-matches-panel-doubles')).roundMatchesSheetsModule().MatchFormSheet }));
vi.mock('./MatchLineupSheet', async () => ({ MatchLineupSheet: (await import('../../../test/doubles/round-matches-panel-doubles')).roundMatchesSheetsModule().MatchLineupSheet }));
vi.mock('../../../components/admin/AdminPageShell', async () => (await import('../../../test/doubles/round-matches-panel-doubles')).roundMatchesTableModule());

describe('A07 SeasonRoundsPanel — error/aria-busy/disabled', () => {
  beforeEach(() => {
    sState.rounds = { data: [], isLoading: false, isError: false, isFetching: false, refetch: vi.fn() } as unknown as typeof sState.rounds;
    sState.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof sState.remove;
    sState.confirm = vi.fn(async () => true) as unknown as typeof sState.confirm;
    sState.apiGet = vi.fn(async () => ({ data: {} })) as unknown as typeof sState.apiGet;
    sState.onSelectRound = vi.fn();
  });
  it('error prikazuje alert i retry disabled kad isFetching', () => {
    sState.rounds = { data: [], isLoading: false, isError: true, isFetching: true, refetch: vi.fn() } as unknown as typeof sState.rounds;
    render(<SeasonRoundsPanel seasonId="se1" selectedRoundId={null} onSelectRound={vi.fn()} canManage />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });
  it('loading prikazuje aria-busy skeleton', () => {
    sState.rounds = { data: [], isLoading: true, isError: false, isFetching: true, refetch: vi.fn() } as unknown as typeof sState.rounds;
    render(<SeasonRoundsPanel seasonId="se1" selectedRoundId={null} onSelectRound={vi.fn()} canManage />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
  it('delete isPending disableuje dugmad', () => {
    sState.rounds = { data: [{ id: 'r1', number: 1, name: 'Kolo 1', _count: { matches: 0 } }], isLoading: false, isError: false, isFetching: false, refetch: vi.fn() } as unknown as typeof sState.rounds;
    sState.remove = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof sState.remove;
    render(<SeasonRoundsPanel seasonId="se1" selectedRoundId={null} onSelectRound={vi.fn()} canManage />);
    expect(screen.getByRole('button', { name: 'actions.edit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'actions.delete' })).toBeDisabled();
  });
});

describe('A07 RoundMatchesPanel — error/aria-busy/disabled', () => {
  beforeEach(() => { resetRoundMatchesState(); (mState as unknown as Record<string, unknown>).isError = false; (mState as unknown as Record<string, unknown>).isFetching = false; (mState as unknown as Record<string, unknown>).refetch = vi.fn(); });
  it('error prikazuje alert', () => {
    (mState as unknown as Record<string, unknown>).isError = true;
    (mState as unknown as Record<string, unknown>).isFetching = false;
    render(<MemoryRouter><RoundMatchesPanel seasonId="se1" roundId="r1" canManage /></MemoryRouter>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  it('loading aria-busy', () => {
    mState.isLoading = true;
    render(<MemoryRouter><RoundMatchesPanel seasonId="se1" roundId="r1" canManage /></MemoryRouter>);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
  it('delete pending disableuje akcije', () => {
    (mState.remove as unknown as Record<string, unknown>).isPending = true;
    mState.removePending = true;
    mState.matches = [roundMatch()];
    render(<MemoryRouter><RoundMatchesPanel seasonId="se1" roundId="r1" canManage /></MemoryRouter>);
    const btn = screen.getByRole('button', { name: 'Postava' });
    expect(btn).toBeDisabled();
  });
});
