import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SponsorsAdminPage } from './SponsorsAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  perms: [] as string[],
  list: { data: [] as Array<Record<string, unknown>>, isLoading: false, isError: false, refetch: vi.fn() },
  remove: { mutateAsync: vi.fn(async () => ({})) },
  reorder: { mutateAsync: vi.fn(async () => ({})) },
  confirm: vi.fn(async () => true),
  sheet: null as null | { open: boolean; edit: Record<string, unknown> | null },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks', () => ({ useSponsors: () => state.list }));
vi.mock('../../hooks/use-content-admin', () => ({
  useDeleteSponsor: () => state.remove,
  useReorderSponsors: () => state.reorder,
}));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./SponsorsAdminFormSheet', () => ({
  SponsorsAdminFormSheet: (props: {
    open: boolean; edit: Record<string, unknown> | null; onOpenChange: (open: boolean) => void;
  }) => {
    state.sheet = props;
    return (
      <button type="button" onClick={() => props.onOpenChange(false)}>
        sheet:{String(props.open)}:{String(props.edit?.id ?? '-')}
      </button>
    );
  },
}));

const sponsor = (over: Record<string, unknown> = {}) => ({
  id: 'sp1', name: 'Bank', tier: 'GOLD', ...over,
});

beforeEach(() => {
  state.perms = ['sponsors.manage'];
  state.list = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
  state.remove = { mutateAsync: vi.fn(async () => ({})) };
  state.reorder = { mutateAsync: vi.fn(async () => ({})) };
  state.confirm = vi.fn(async () => true);
  state.sheet = null;
  adminShellState.retried = 0;
});

describe('SponsorsAdminPage — prikaz i dozvole', () => {
  it('prikazuje sponzore sa nazivom i kategorijom', () => {
    state.list = { ...state.list, data: [sponsor(), sponsor({ id: 'sp2', name: 'Caffe', tier: 'SILVER' })] };
    render(<SponsorsAdminPage />);
    const row = screen.getByTestId('row-sp1');
    expect(within(row).getByText('Bank')).toBeInTheDocument();
    expect(within(row).getByText('GOLD')).toBeInTheDocument();
    expect(screen.getByText('Caffe')).toBeInTheDocument();
  });

  it('greška učitavanja nudi ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, isError: true };
    render(<SponsorsAdminPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.list.refetch).toHaveBeenCalledTimes(1);
  });

  it('bez dozvole nema dugmeta Novi ni akcija', () => {
    state.perms = [];
    state.list = { ...state.list, data: [sponsor()] };
    render(<SponsorsAdminPage />);
    expect(screen.queryByRole('button', { name: 'Novi' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'admin.common.moveUp' })).toBeNull();
  });

  it('prvi i zadnji red imaju ograničen pomak', () => {
    state.list = { ...state.list, data: [sponsor(), sponsor({ id: 'sp2' })] };
    render(<SponsorsAdminPage />);
    expect(within(screen.getByTestId('row-sp1')).getByRole('button', { name: 'admin.common.moveUp' })).toBeDisabled();
    expect(within(screen.getByTestId('row-sp2')).getByRole('button', { name: 'admin.common.moveDown' })).toBeDisabled();
  });
});

describe('SponsorsAdminPage — akcije', () => {
  it('pomak gore i dolje šalju novi redoslijed', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [sponsor(), sponsor({ id: 'sp2' })] };
    render(<SponsorsAdminPage />);
    await user.click(within(screen.getByTestId('row-sp2')).getByRole('button', { name: 'admin.common.moveUp' }));
    await waitFor(() => expect(state.reorder.mutateAsync).toHaveBeenCalledWith(['sp2', 'sp1']));
    await user.click(within(screen.getByTestId('row-sp1')).getByRole('button', { name: 'admin.common.moveDown' }));
    await waitFor(() => expect(state.reorder.mutateAsync).toHaveBeenCalledTimes(2));
  });

  it('uređivanje otvara sheet sa sponzorom, a Novi prazan sheet', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [sponsor()] };
    render(<SponsorsAdminPage />);
    expect(screen.getByText('sheet:false:-')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText('sheet:true:sp1')).toBeInTheDocument();
  });

  it('brisanje traži potvrdu sa nazivom i šalje ID', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [sponsor()] };
    render(<SponsorsAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith('sp1'));
    expect(state.confirm).toHaveBeenCalledWith({
      title: 'Obrisati sponzora?', description: '"Bank" će biti obrisan.',
      confirmLabel: 'Obriši', variant: 'danger',
    });
  });

  it('odbijena potvrda ne briše sponzora', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    state.list = { ...state.list, data: [sponsor()] };
    render(<SponsorsAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });

  it('dugme Novi otvara prazan sheet', async () => {
    const user = userEvent.setup();
    render(<SponsorsAdminPage />);
    await user.click(screen.getByRole('button', { name: 'Novi' }));
    expect(screen.getByText('sheet:true:-')).toBeInTheDocument();
  });

  it('zatvaranje sheeta resetuje odabranog sponzora', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [sponsor()] };
    render(<SponsorsAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText('sheet:true:sp1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /sheet:/ }));
    expect(screen.getByText('sheet:false:-')).toBeInTheDocument();
  });

  it('prazna lista prikazuje tabelu bez redova', () => {
    render(<SponsorsAdminPage />);
    expect(screen.queryAllByTestId(/^row-/)).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Novi' })).toBeInTheDocument();
  });
});
