import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubsAdminPage } from './ClubsAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  clubs: { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  perms: [] as string[],
  confirm: vi.fn(async () => true),
  deleteClub: { mutateAsync: vi.fn(async () => ({})), isPending: false },
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
  useClubs: () => ({ ...state.clubs, refetch: state.clubs.refetch }),
  usePlayers: () => ({ data: [] }),
  useOwnClub: () => ({ data: null }),
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useDeleteClub: () => ({ mutateAsync: state.deleteClub.mutateAsync, isPending: state.deleteClub.isPending }),
  useDeletePlayer: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../lib/media', () => ({ mediaUrl: (p: string, s: string) => `${s}:${p}` }));
vi.mock('../../lib/club-utils', () => ({ clubCrestPath: (c: { crestPath?: string; logoPath?: string }) => c.crestPath ?? c.logoPath }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./ClubsAdminFormSheet', () => ({
  ClubsAdminFormSheet: (props: Record<string, unknown>) => <div data-testid="clubs-sheet">sheet:{String(props.open)}</div>,
}));
vi.mock('./PlayersAdminFormSheet', () => ({ PlayersAdminFormSheet: () => null }));

const club = (over: Record<string, unknown> = {}) => ({
  id: 'c1',
  name: 'FK Gračanica',
  city: 'Gračanica',
  stadium: 'Luke',
  isOwnClub: true,
  crestPath: 'grb.png',
  ...over,
});

beforeEach(() => {
  state.clubs = { data: [club(), club({ id: 'c2', name: 'NK Zenica', isOwnClub: false, crestPath: undefined })] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.clubs;
  state.perms = ['clubs.manage'];
  state.confirm = vi.fn(async () => true);
  state.deleteClub = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.deleteClub;
  adminShellState.retried = 0;
  adminShellState.refreshed = 0;
  adminShellState.title = '';
});

describe('B03 ClubsAdminPage — P1/P2', () => {
  it('error — role=alert, heading ostaje, retry poziva refetch', async () => {
    state.clubs = { data: [] as unknown[], isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.clubs;
    render(<ClubsAdminPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.clubsList.title' })).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'pokušaj-ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.clubs.refetch).toHaveBeenCalled();
  });

  it('error retry disabled kad isFetching', () => {
    state.clubs = { data: [] as unknown[], isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.clubs;
    render(<ClubsAdminPage />);
    const alert = screen.getByRole('alert');
    const btn = within(alert).getByRole('button', { name: 'pokušaj-ponovo' });
    expect(btn).toBeDisabled();
  });

  it('loading — aria-busy skeleton', () => {
    state.clubs = { data: [] as unknown[], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.clubs;
    render(<ClubsAdminPage />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.getByText('učitavanje')).toBeInTheDocument();
  });

  it('empty ima role=status', () => {
    state.clubs = { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.clubs;
    render(<ClubsAdminPage />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('lastUpdated i Osvježi poziva refetch, disabled kad fetching', async () => {
    const ts = Date.now();
    state.clubs = { data: [club()] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.clubs;
    render(<ClubsAdminPage />);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.clubs.refetch).toHaveBeenCalled();
    state.clubs = { data: [club()] as unknown[], isLoading: false, isError: false, isFetching: true, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.clubs;
    render(<ClubsAdminPage />);
    const btn2 = screen.getAllByRole('button', { name: /Učitavanje/ })[0] as HTMLButtonElement;
    expect(btn2).toBeDisabled();
  });

  it('delete i Novi disabled kad isPending (global)', () => {
    state.deleteClub = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.deleteClub;
    render(<ClubsAdminPage />);
    const novi = screen.getByRole('button', { name: /Novi/ });
    expect(novi).toBeDisabled();
    const editBtns = screen.getAllByRole('button', { name: 'actions.edit' });
    const delBtns = screen.getAllByRole('button', { name: 'actions.delete' });
    expect(editBtns[0]).toBeDisabled();
    expect(delBtns[0]).toBeDisabled();
  });

  it('bez permisije nema Novi ni akcija', () => {
    state.perms = [];
    render(<ClubsAdminPage />);
    expect(screen.queryByRole('button', { name: /Novi/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
  });
});
