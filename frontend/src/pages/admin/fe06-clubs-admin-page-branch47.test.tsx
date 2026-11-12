import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ClubsAdminPage } from './ClubsAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

type Row = Record<string, unknown> & { id: string };
const state = vi.hoisted(() => ({
  clubs: { data: undefined as unknown, isLoading: false, isError: false } as { data: unknown; isLoading: boolean; isError: boolean },
  refetch: vi.fn(),
  perms: [] as string[],
  confirm: vi.fn(),
  remove: vi.fn(),
  sheet: {} as Record<string, unknown>,
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({ useClubs: () => ({ ...state.clubs, refetch: state.refetch }) }));
vi.mock('../../hooks/use-competition-admin', () => ({ useDeleteClub: () => ({ mutateAsync: state.remove }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../lib/media', () => ({ mediaUrl: (p: string, s: string) => `${s}:${p}` }));
vi.mock('../../lib/club-utils', () => ({ clubCrestPath: (c: { crestPath?: string; logoPath?: string }) => c.crestPath ?? c.logoPath }));
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: doubles.AdminPageShellDouble, AdminDataTable: doubles.AdminDataTableDouble };
});
vi.mock('./ClubsAdminFormSheet', () => ({
  ClubsAdminFormSheet: (props: Record<string, unknown>) => {
    state.sheet = props;
    const edit = props.edit as Row | null;
    return (
      <div>
        sheet:{String(props.open)}:{String(edit?.id ?? '-')}
        <button onClick={() => (props.onOpenChange as (o: boolean) => void)(true)}>otvori-sheet</button>
        <button onClick={() => (props.onOpenChange as (o: boolean) => void)(false)}>zatvori-sheet</button>
      </div>
    );
  },
}));

const club = (over: Record<string, unknown> = {}) => ({
  id: 'c1', name: 'FK Gračanica', city: 'Gračanica', stadium: 'Stadion Luke', isOwnClub: true, crestPath: 'mediji/grb.png', ...over,
});
const row = (id: string) => screen.getByTestId(`row-${id}`);

beforeEach(() => {
  state.clubs = { data: [club(), club({ id: 'c2', name: 'NK Zenica' })], isLoading: false, isError: false } as never;
  state.refetch.mockReset(); state.perms = ['clubs.manage'];
  state.confirm.mockReset(); state.confirm.mockResolvedValue(true);
  state.remove.mockReset(); state.remove.mockResolvedValue({}); state.sheet = {}; adminShellState.retried = 0;
});

describe('ClubsAdminPage — branch47 (2 grane ?? i if !o)', () => {
  it('data ?? [] fallback kada je data undefined prikazuje praznu tabelu', () => {
    state.clubs = { data: undefined, isLoading: false, isError: false } as never;
    render(<ClubsAdminPage />);
    expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
  });

  it('data definisano prikazuje redove', () => {
    render(<ClubsAdminPage />);
    expect(within(row('c1')).getByText('FK Gračanica')).toBeInTheDocument();
  });

  it('otvaranje sheet-a ne briše edit (if !o false)', async () => {
    const user = userEvent.setup();
    render(<ClubsAdminPage />);
    await user.click(within(row('c1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:c1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.getByText(/sheet:false:-/)).toBeInTheDocument();
    await user.click(within(row('c1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:c1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'otvori-sheet' }));
    expect(screen.getByText(/sheet:true:c1/)).toBeInTheDocument();
  });
});
