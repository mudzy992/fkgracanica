import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubsAdminPage } from './ClubsAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

type Row = Record<string, unknown> & { id: string };

const state = vi.hoisted(() => ({
  clubs: { data: undefined as unknown, isLoading: false, isError: false },
  refetch: vi.fn(),
  perms: [] as string[],
  confirm: vi.fn(),
  remove: vi.fn(),
  sheet: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useClubs: () => ({ ...state.clubs, refetch: state.refetch }),
}));
vi.mock('../../hooks/use-competition-admin', () => ({
  useDeleteClub: () => ({ mutateAsync: state.remove }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../lib/media', () => ({ mediaUrl: (path: string, size: string) => `${size}:${path}` }));
vi.mock('../../lib/club-utils', () => ({
  clubCrestPath: (club: { crestPath?: string; logoPath?: string }) => club.crestPath ?? club.logoPath,
}));
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
        <button onClick={() => (props.onOpenChange as (o: boolean) => void)(false)}>zatvori-sheet</button>
      </div>
    );
  },
}));

const club = (over: Record<string, unknown> = {}) => ({
  id: 'c1',
  name: 'FK Gračanica',
  city: 'Gračanica',
  stadium: 'Stadion Luke',
  isOwnClub: true,
  crestPath: 'mediji/grb.png',
  ...over,
});

const row = (id: string) => screen.getByTestId(`row-${id}`);

beforeEach(() => {
  state.clubs = {
    data: [club(), club({ id: 'c2', name: 'NK Zenica', city: null, stadium: null, isOwnClub: false, crestPath: undefined })],
    isLoading: false,
    isError: false,
  };
  state.refetch.mockReset();
  state.perms = ['clubs.manage'];
  state.confirm.mockReset();
  state.confirm.mockResolvedValue(true);
  state.remove.mockReset();
  state.remove.mockResolvedValue({});
  state.sheet = {};
  adminShellState.retried = 0;
});

describe('ClubsAdminPage — tabela', () => {
  it('prikazuje naslov, SEO i redove sa gradom i stadionom', () => {
    render(<ClubsAdminPage />);
    expect(screen.getByText('seo:admin.clubsList.title')).toBeInTheDocument();
    expect(adminShellState.title).toBe('admin.clubsList.title');
    expect(within(row('c1')).getByText('FK Gračanica')).toBeInTheDocument();
    expect(within(row('c1')).getByText('Gračanica')).toBeInTheDocument();
    expect(within(row('c1')).getByText('Stadion Luke')).toBeInTheDocument();
  });

  it('grb se prikazuje preko mediaUrl sa veličinom thumb', () => {
    render(<ClubsAdminPage />);
    // dekorativna slika (alt="") nema role="img" — traži se direktno u DOM-u
    expect(within(row('c1')).getByText('FK Gračanica').closest('[data-testid]')?.querySelector('img'))
      .toHaveAttribute('src', 'thumb:mediji/grb.png');
    expect(row('c2').querySelector('img')).toBeNull();
  });

  it('nema grada/stadiona daje crtice, a oznaka "Naš klub" prati zastavicu', () => {
    render(<ClubsAdminPage />);
    expect(within(row('c2')).getAllByText('—').length).toBeGreaterThanOrEqual(2);
    expect(within(row('c1')).getByText('Da')).toBeInTheDocument();
    expect(within(row('c2')).getByText('Ne')).toBeInTheDocument();
  });

  it('logoPath se koristi kad nema crestPath', () => {
    state.clubs = { data: [club({ crestPath: undefined, logoPath: 'mediji/logo.png' })], isLoading: false, isError: false };
    render(<ClubsAdminPage />);
    expect(row('c1').querySelector('img')).toHaveAttribute('src', 'thumb:mediji/logo.png');
  });

  it('prazna lista i greška sa ponovnim pokušajem', async () => {
    const user = userEvent.setup();
    state.clubs = { data: [], isLoading: false, isError: true };
    render(<ClubsAdminPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(adminShellState.retried).toBe(1);
    state.clubs = { data: [], isLoading: false, isError: false };
    render(<ClubsAdminPage />);
    expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
  });
});

describe('ClubsAdminPage — dozvole i akcije', () => {
  it('bez clubs.manage nema dugmeta Novi ni akcija u redu', () => {
    state.perms = [];
    render(<ClubsAdminPage />);
    expect(screen.queryByRole('button', { name: /Novi/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
  });

  it('Novi otvara praznu formu, izmjena šalje zapis', async () => {
    const user = userEvent.setup();
    render(<ClubsAdminPage />);
    expect(state.sheet.open).toBe(false);
    await user.click(screen.getByRole('button', { name: /Novi/ }));
    expect(state.sheet).toMatchObject({ open: true, edit: null });
    await user.click(within(row('c1')).getByRole('button', { name: 'actions.edit' }));
    expect((state.sheet.edit as Row).id).toBe('c1');
    expect(screen.getByText('sheet:true:c1')).toBeInTheDocument();
  });

  it('brisanje traži potvrdu sa nazivom u navodnicima pa briše', async () => {
    const user = userEvent.setup();
    render(<ClubsAdminPage />);
    await user.click(within(row('c1')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Obrisati klub?',
        description: '"FK Gračanica" će biti obrisan.',
        confirmLabel: 'Obriši',
        variant: 'danger',
      }),
    );
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith('c1'));
  });

  it('odbijena potvrda ne briše klub', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    render(<ClubsAdminPage />);
    await user.click(within(row('c2')).getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalled());
    expect(state.remove).not.toHaveBeenCalled();
  });

  it('zatvaranje sheeta briše odabrani klub', async () => {
    const user = userEvent.setup();
    render(<ClubsAdminPage />);
    await user.click(within(row('c1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:c1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.getByText(/sheet:false:-/)).toBeInTheDocument();
  });
});
