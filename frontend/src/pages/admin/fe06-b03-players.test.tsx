import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayersAdminPage } from './PlayersAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  players: { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  perms: [] as string[],
  confirm: vi.fn(async () => true),
  deletePlayer: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue) {
        let s = opts.defaultValue as string;
        if (opts.time) s = s.replace('{{time}}', opts.time as string);
        return s;
      }
      return k;
    },
  }),
}));
vi.mock('../../hooks', () => ({
  useClubs: () => ({ data: [] }),
  usePlayers: () => ({ ...state.players, refetch: state.players.refetch }),
  useOwnClub: () => ({ data: null }),
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useDeleteClub: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeletePlayer: () => ({ mutateAsync: state.deletePlayer.mutateAsync, isPending: state.deletePlayer.isPending }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../lib/player-utils', () => ({ playerPositionLabel: (p: string) => `pos:${p}` }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./ClubsAdminFormSheet', () => ({ ClubsAdminFormSheet: () => null }));
vi.mock('./PlayersAdminFormSheet', () => ({
  PlayersAdminFormSheet: (props: Record<string, unknown>) => <div data-testid="players-sheet">sheet:{String(props.open)}</div>,
}));

const player = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  firstName: 'Amar',
  lastName: 'Agić',
  position: 'FWD',
  number: 9,
  isActive: true,
  club: { name: 'FK Gračanica' },
  ...over,
});

beforeEach(() => {
  state.players = { data: [player(), player({ id: 'p2', firstName: 'Edin', lastName: 'Džeko', number: null, isActive: false })] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.players;
  state.perms = ['players.manage'];
  state.confirm = vi.fn(async () => true);
  state.deletePlayer = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.deletePlayer;
  adminShellState.retried = 0;
  // @ts-expect-error refreshed is for test
  adminShellState.refreshed = 0;
  adminShellState.title = '';
});

describe('B03 PlayersAdminPage — P1/P2', () => {
  it('error — role=alert, retry', async () => {
    state.players = { data: [] as unknown[], isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.players;
    render(<PlayersAdminPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.players' })).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'pokušaj-ponovo' });
    await userEvent.click(btn);
    expect(state.players.refetch).toHaveBeenCalled();
  });

  it('loading aria-busy', () => {
    state.players = { data: [] as unknown[], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.players;
    render(<PlayersAdminPage />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('empty role=status', () => {
    state.players = { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.players;
    render(<PlayersAdminPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lastUpdated Osvježi', async () => {
    const ts = Date.now();
    state.players = { data: [player()] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.players;
    render(<PlayersAdminPage />);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Osvježi' }));
    expect(state.players.refetch).toHaveBeenCalled();
  });

  it('delete disabled kad isPending', () => {
    state.deletePlayer = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.deletePlayer;
    render(<PlayersAdminPage />);
    expect(screen.getByRole('button', { name: /Novi/ })).toBeDisabled();
    const btns = screen.getAllByRole('button', { name: 'actions.delete' });
    expect(btns[0]).toBeDisabled();
  });

  it('bez permisije nema Novi', () => {
    state.perms = [];
    render(<PlayersAdminPage />);
    expect(screen.queryByRole('button', { name: /Novi/ })).toBeNull();
  });
});
