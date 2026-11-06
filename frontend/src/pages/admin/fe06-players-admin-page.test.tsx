import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayersAdminPage } from './PlayersAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

type Row = Record<string, unknown> & { id: string };

const state = vi.hoisted(() => ({
  players: { data: undefined as unknown, isLoading: false, isError: false },
  refetch: vi.fn(),
  params: [] as unknown[],
  perms: [] as string[],
  confirm: vi.fn(),
  remove: vi.fn(),
  sheet: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  usePlayers: () => {
    state.params.push(1);
    return { ...state.players, refetch: state.refetch };
  },
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useDeletePlayer: () => ({ mutateAsync: state.remove }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../lib/player-utils', () => ({
  playerPositionLabel: (position?: string | null) => (position ? `poz:${position}` : '—'),
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: doubles.AdminPageShellDouble, AdminDataTable: doubles.AdminDataTableDouble };
});
vi.mock('./PlayersAdminFormSheet', () => ({
  PlayersAdminFormSheet: (props: Record<string, unknown>) => {
    state.sheet = props;
    const edit = props.edit as Row | null;
    return (
      <div>
        sheet:{String(props.open)}:{String(edit?.id ?? '-')}:{String(props.clubId ?? '-')}
        <button onClick={() => (props.onOpenChange as (o: boolean) => void)(false)}>zatvori-sheet</button>
      </div>
    );
  },
}));

const player = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  firstName: 'Amar',
  lastName: 'Hodžić',
  position: 'GK',
  number: 1,
  isActive: true,
  club: { name: 'FK Gračanica' },
  ...over,
});

const row = (id: string) => screen.getByTestId(`row-${id}`);

beforeEach(() => {
  state.players = {
    data: [player(), player({ id: 'p2', firstName: 'Niko', lastName: 'Nekić', number: null, isActive: false, position: null, club: null })],
    isLoading: false,
    isError: false,
  };
  state.refetch.mockReset();
  state.params = [];
  state.perms = ['players.manage'];
  state.confirm.mockReset();
  state.confirm.mockResolvedValue(true);
  state.remove.mockReset();
  state.remove.mockResolvedValue({});
  state.sheet = {};
  adminShellState.retried = 0;
});

describe('PlayersAdminPage — tabela', () => {
  it('prikazuje naslov, SEO i igrače sa klubom i brojem', () => {
    render(<PlayersAdminPage />);
    expect(screen.getByText('seo:admin.players')).toBeInTheDocument();
    expect(adminShellState.title).toBe('admin.players');
    expect(within(row('p1')).getByText(/Amar Hodžić/)).toBeInTheDocument();
    expect(within(row('p1')).getByText('FK Gračanica')).toBeInTheDocument();
    expect(within(row('p1')).getByText('poz:GK')).toBeInTheDocument();
    expect(within(row('p1')).getByText('1')).toBeInTheDocument();
  });

  it('neaktivan igrač ima oznaku, a nedostajuća polja crtice', () => {
    render(<PlayersAdminPage />);
    expect(within(row('p2')).getByText('admin.playerForm.inactive')).toBeInTheDocument();
    expect(within(row('p2')).getAllByText('—').length).toBeGreaterThanOrEqual(3);
  });

  it('prazna lista i greška sa ponovnim pokušajem', async () => {
    const user = userEvent.setup();
    state.players = { data: [], isLoading: false, isError: true };
    render(<PlayersAdminPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
  });
});

describe('PlayersAdminPage — dozvole i akcije', () => {
  it('bez players.manage nema dugmeta Novi ni akcija', () => {
    state.perms = [];
    render(<PlayersAdminPage />);
    expect(screen.queryByRole('button', { name: /Novi/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
  });

  it('Novi otvara praznu formu bez kluba, izmjena šalje zapis', async () => {
    const user = userEvent.setup();
    render(<PlayersAdminPage />);
    expect(state.sheet.open).toBe(false);
    await user.click(screen.getByRole('button', { name: /Novi/ }));
    expect(state.sheet).toMatchObject({ open: true, edit: null });
    expect(screen.getByText('sheet:true:-:-')).toBeInTheDocument();
    await user.click(within(row('p1')).getByRole('button', { name: 'actions.edit' }));
    expect((state.sheet.edit as Row).id).toBe('p1');
  });

  it('brisanje traži potvrdu sa punim imenom pa briše', async () => {
    const user = userEvent.setup();
    render(<PlayersAdminPage />);
    await user.click(within(row('p1')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Obrisati igrača?',
        description: 'Amar Hodžić će biti obrisan.',
        confirmLabel: 'Obriši',
        variant: 'danger',
      }),
    );
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith('p1'));
  });

  it('odbijena potvrda ne briše igrača', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    render(<PlayersAdminPage />);
    await user.click(within(row('p2')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.remove).not.toHaveBeenCalled();
  });

  it('zatvaranje sheet-a briše odabranog igrača', async () => {
    const user = userEvent.setup();
    render(<PlayersAdminPage />);
    await user.click(within(row('p1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:p1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.getByText(/sheet:false:-/)).toBeInTheDocument();
  });
});
