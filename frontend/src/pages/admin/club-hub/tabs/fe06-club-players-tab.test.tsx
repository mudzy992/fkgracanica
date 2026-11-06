import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubPlayersTab } from './ClubPlayersTab';

type Row = Record<string, unknown> & { id: string };

const state = vi.hoisted(() => ({
  players: { data: undefined as unknown, isLoading: false },
  params: [] as Array<Record<string, unknown>>,
  perms: [] as string[],
  confirm: vi.fn(),
  remove: vi.fn(),
  sheet: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../hooks', () => ({
  usePlayers: (params: Record<string, unknown>) => {
    state.params.push(params);
    return state.players;
  },
}));
vi.mock('../../../../hooks/use-competition-admin', () => ({
  useDeletePlayer: () => ({ mutateAsync: state.remove }),
}));
vi.mock('../../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../../../lib/player-utils', () => ({
  playerPositionLabel: (position: string | null) => `poz:${String(position)}`,
}));
vi.mock('../../../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../../../test/doubles/admin-shell-doubles');
  return { AdminDataTable: doubles.AdminDataTableDouble };
});
vi.mock('../../PlayersAdminFormSheet', () => ({
  PlayersAdminFormSheet: (props: Record<string, unknown>) => {
    state.sheet = props;
    const edit = props.edit as Row | null;
    return (
      <div>
        sheet:{String(props.open)}:{String(edit?.id ?? '-')}:{String(props.clubId)}
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
  ...over,
});

const row = (id: string) => screen.getByTestId(`row-${id}`);

beforeEach(() => {
  state.players = { data: [player(), player({ id: 'p2', firstName: 'Niko', lastName: 'Nekić', number: null, isActive: false })], isLoading: false };
  state.params = [];
  state.perms = ['players.manage'];
  state.confirm.mockReset();
  state.confirm.mockResolvedValue(true);
  state.remove.mockReset();
  state.remove.mockResolvedValue({});
  state.sheet = {};
});

describe('ClubPlayersTab — učitavanje i tabela', () => {
  it('dok igrači nisu učitani prikazuje poruku i traži klub', () => {
    state.players = { data: undefined, isLoading: true };
    render(<ClubPlayersTab clubId="c1" />);
    expect(screen.getByText('admin.common.loading')).toBeInTheDocument();
    expect(state.params.at(-1)).toEqual({ clubId: 'c1' });
  });

  it('prikazuje ime, poziciju, broj i oznaku neaktivnog igrača', () => {
    render(<ClubPlayersTab clubId="c1" />);
    expect(within(row('p1')).getByText(/Amar Hodžić/)).toBeInTheDocument();
    expect(within(row('p1')).getByText('poz:GK')).toBeInTheDocument();
    expect(within(row('p1')).getByText('1')).toBeInTheDocument();
    expect(within(row('p2')).getByText('admin.playerForm.inactive')).toBeInTheDocument();
    expect(within(row('p2')).getByText('—')).toBeInTheDocument();
  });

  it('prazna lista i lista bez podataka daju prazan prikaz', () => {
    state.players = { data: [], isLoading: false };
    const { unmount } = render(<ClubPlayersTab clubId="c1" />);
    expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
    unmount();
    state.players = { data: undefined, isLoading: false };
    render(<ClubPlayersTab clubId="c1" />);
    expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
  });
});

describe('ClubPlayersTab — dozvole i obrasci', () => {
  it('bez players.manage nema novog igrača ni akcija u redu', () => {
    state.perms = [];
    render(<ClubPlayersTab clubId="c1" />);
    expect(screen.queryByRole('button', { name: /Novi igrač/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(within(row('p1')).getByText(/Amar Hodžić/)).toBeInTheDocument();
  });

  it('Novi igrač otvara praznu formu sa klubom', async () => {
    const user = userEvent.setup();
    render(<ClubPlayersTab clubId="c1" />);
    expect(state.sheet.open).toBe(false);
    await user.click(screen.getByRole('button', { name: /Novi igrač/ }));
    expect(state.sheet).toMatchObject({ open: true, edit: null, clubId: 'c1' });
    expect(screen.getByText('sheet:true:-:c1')).toBeInTheDocument();
  });

  it('izmjena šalje postojeći zapis', async () => {
    const user = userEvent.setup();
    render(<ClubPlayersTab clubId="c1" />);
    await user.click(within(row('p1')).getByRole('button', { name: 'actions.edit' }));
    expect((state.sheet.edit as Row).id).toBe('p1');
    expect(screen.getByText('sheet:true:p1:c1')).toBeInTheDocument();
  });
});

describe('ClubPlayersTab — brisanje', () => {
  it('brisanje traži potvrdu sa imenom pa briše', async () => {
    const user = userEvent.setup();
    render(<ClubPlayersTab clubId="c1" />);
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
    render(<ClubPlayersTab clubId="c1" />);
    await user.click(within(row('p2')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.remove).not.toHaveBeenCalled();
  });

  it('zatvaranje sheet-a briše odabranog igrača', async () => {
    const user = userEvent.setup();
    render(<ClubPlayersTab clubId="c1" />);
    await user.click(within(row('p1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:p1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.getByText(/sheet:false:-/)).toBeInTheDocument();
  });
});
