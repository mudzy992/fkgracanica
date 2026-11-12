import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrophiesAdminPage } from './TrophiesAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  trophies: { data: undefined as unknown, isLoading: false, isError: false },
  refetch: vi.fn(),
  remove: vi.fn(),
  perms: true,
  confirmAnswer: true,
  confirmCalls: [] as unknown[],
  sheet: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useTrophies: () => ({ ...state.trophies, refetch: state.refetch }),
}));
vi.mock('../../hooks/use-content-admin', () => ({
  useDeleteTrophy: () => ({ mutateAsync: state.remove }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: [] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => state.perms }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({
    confirm: (options: unknown) => {
      state.confirmCalls.push(options);
      return Promise.resolve(state.confirmAnswer);
    },
    dialog: <div>confirm-dijalog</div>,
  }),
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../test/doubles/admin-shell-doubles');
  return {
    AdminPageShell: doubles.AdminPageShellDouble,
    AdminDataTable: doubles.AdminDataTableDouble,
  };
});
vi.mock('./TrophiesAdminFormSheet', () => ({
  TrophiesAdminFormSheet: (props: Record<string, unknown>) => {
    state.sheet = props;
    return (
      <div>
        forma:{String(props.open)}:{(props.edit as { name?: string } | null)?.name ?? '-'}
        <button onClick={() => (props.onOpenChange as (open: boolean) => void)(false)}>zatvori-formu</button>
      </div>
    );
  },
}));

const trophy = (over: Record<string, unknown> = {}) => ({
  id: 'tr1',
  name: 'Prvenstvo BiH',
  year: 1974,
  featured: false,
  ...over,
});

beforeEach(() => {
  state.trophies = { data: [trophy()], isLoading: false, isError: false };
  state.refetch.mockReset();
  state.remove.mockReset().mockResolvedValue(undefined);
  state.perms = true;
  state.confirmAnswer = true;
  state.confirmCalls = [];
  state.sheet = {};
  adminShellState.retried = 0;
});

describe('TrophiesAdminPage — tabela', () => {
  it('prikazuje SEO, naslov i redove trofeja', () => {
    render(<TrophiesAdminPage />);
    expect(screen.getByText('seo:admin.trophies')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.trophies' })).toBeInTheDocument();
    expect(screen.getByText('Prvenstvo BiH')).toBeInTheDocument();
    expect(screen.getByText('1974')).toBeInTheDocument();
    expect(screen.queryByText('Istaknut')).toBeNull();
  });

  it('istaknut trofej dobija oznaku', () => {
    state.trophies = { data: [trophy({ featured: true })], isLoading: false, isError: false };
    render(<TrophiesAdminPage />);
    expect(screen.getByText('Istaknut')).toBeInTheDocument();
  });

  it('greška prikazuje dugme za ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.trophies = { data: undefined, isLoading: false, isError: true };
    render(<TrophiesAdminPage />);
    expect(screen.getByText('greška-učitavanja')).toBeInTheDocument();
    await user.click(screen.getByText('pokušaj-ponovo'));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });

  it('učitavanje skriva tabelu', () => {
    state.trophies = { data: undefined, isLoading: true, isError: false };
    render(<TrophiesAdminPage />);
    expect(screen.getByText('učitavanje')).toBeInTheDocument();
    expect(screen.queryByText('Prvenstvo BiH')).toBeNull();
  });

  it('bez podataka tabela je prazna', () => {
    state.trophies = { data: [], isLoading: false, isError: false };
    render(<TrophiesAdminPage />);
    expect(screen.queryByText('Prvenstvo BiH')).toBeNull();
  });
});

describe('TrophiesAdminPage — dozvole', () => {
  it('bez dozvole nema dugmeta Novi ni akcija u redu', () => {
    state.perms = false;
    render(<TrophiesAdminPage />);
    expect(screen.queryByRole('button', { name: /Novi/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
    expect(screen.getByText('Prvenstvo BiH')).toBeInTheDocument();
  });

  it('sa dozvolom otvara formu za novi trofej', async () => {
    const user = userEvent.setup();
    render(<TrophiesAdminPage />);
    await user.click(screen.getByRole('button', { name: /Novi/ }));
    expect(screen.getByText('forma:true:-')).toBeInTheDocument();
    expect(state.sheet).toMatchObject({ open: true, edit: null });
  });

  it('uređivanje otvara formu sa izabranim trofejom', async () => {
    const user = userEvent.setup();
    render(<TrophiesAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText('forma:true:Prvenstvo BiH')).toBeInTheDocument();
  });

  it('zatvaranje forme briše izbor', async () => {
    const user = userEvent.setup();
    render(<TrophiesAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    await user.click(screen.getByText('zatvori-formu'));
    expect(screen.getByText('forma:false:-')).toBeInTheDocument();
  });
});

describe('TrophiesAdminPage — brisanje', () => {
  it('potvrđeno brisanje poziva mutaciju', async () => {
    const user = userEvent.setup();
    render(<TrophiesAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    expect(state.confirmCalls[0]).toMatchObject({
      title: 'Obrisati trofej?',
      description: '"Prvenstvo BiH" će biti obrisan.',
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    expect(state.remove).toHaveBeenCalledWith('tr1');
  });

  it('odustajanje od potvrde ne briše trofej', async () => {
    const user = userEvent.setup();
    state.confirmAnswer = false;
    render(<TrophiesAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    expect(state.remove).not.toHaveBeenCalled();
  });

  it('renderuje confirm dijalog', () => {
    render(<TrophiesAdminPage />);
    expect(screen.getByText('confirm-dijalog')).toBeInTheDocument();
  });
});
