import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimelineAdminPage } from './TimelineAdminPage';
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
vi.mock('../../hooks', () => ({ useClubTimeline: () => state.list }));
vi.mock('../../hooks/use-heritage-admin', () => ({
  useDeleteTimelineEvent: () => state.remove,
  useReorderTimelineEvents: () => state.reorder,
}));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./TimelineAdminFormSheet', () => ({
  TimelineAdminFormSheet: (props: {
    open: boolean; edit: Record<string, unknown> | null; onOpenChange: (o: boolean) => void;
  }) => {
    state.sheet = props;
    return (
      <div>
        sheet:{String(props.open)}:{String(props.edit?.id ?? '-')}
        <button onClick={() => props.onOpenChange(false)}>zatvori-sheet</button>
      </div>
    );
  },
}));

const event = (over: Record<string, unknown> = {}) => ({
  id: 'e1', year: 1921, title: 'Osnivanje kluba', ...over,
});

beforeEach(() => {
  state.perms = ['club-timeline.manage'];
  state.list = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
  state.remove = { mutateAsync: vi.fn(async () => ({})) };
  state.reorder = { mutateAsync: vi.fn(async () => ({})) };
  state.confirm = vi.fn(async () => true);
  state.sheet = null;
  adminShellState.retried = 0;
});

describe('TimelineAdminPage — prikaz i dozvole', () => {
  it('prikazuje događaje sa godinom i naslovom', () => {
    state.list = { ...state.list, data: [event(), event({ id: 'e2', year: 1974, title: 'Prvi trofej' })] };
    render(<TimelineAdminPage />);
    const row = screen.getByTestId('row-e1');
    expect(within(row).getByText('1921')).toBeInTheDocument();
    expect(within(row).getByText('Osnivanje kluba')).toBeInTheDocument();
    expect(screen.getByText('Prvi trofej')).toBeInTheDocument();
  });

  it('greška učitavanja nudi ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, isError: true };
    render(<TimelineAdminPage />);
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.list.refetch).toHaveBeenCalledTimes(1);
  });

  it('bez dozvole nema dugmeta Novi ni akcija u redu', () => {
    state.perms = [];
    state.list = { ...state.list, data: [event()] };
    render(<TimelineAdminPage />);
    expect(screen.queryByRole('button', { name: 'Novi' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
  });

  it('sa dozvolom postoje sve akcije, a prvi i zadnji red imaju ograničen pomak', () => {
    state.list = { ...state.list, data: [event(), event({ id: 'e2' })] };
    render(<TimelineAdminPage />);
    expect(screen.getByRole('button', { name: 'Novi' })).toBeInTheDocument();
    const [firstUp] = within(screen.getByTestId('row-e1')).getAllByRole('button', { name: 'admin.common.moveUp' });
    expect(firstUp).toBeDisabled();
    const [lastDown] = within(screen.getByTestId('row-e2')).getAllByRole('button', { name: 'admin.common.moveDown' });
    expect(lastDown).toBeDisabled();
  });
});

describe('TimelineAdminPage — akcije', () => {
  it('pomak gore mijenja redoslijed i šalje nove ID-eve', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [event(), event({ id: 'e2' })] };
    render(<TimelineAdminPage />);
    await user.click(within(screen.getByTestId('row-e2')).getByRole('button', { name: 'admin.common.moveUp' }));
    await waitFor(() => expect(state.reorder.mutateAsync).toHaveBeenCalledWith(['e2', 'e1']));
  });

  it('pomak dolje mijenja redoslijed i šalje nove ID-eve', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [event(), event({ id: 'e2' })] };
    render(<TimelineAdminPage />);
    await user.click(within(screen.getByTestId('row-e1')).getByRole('button', { name: 'admin.common.moveDown' }));
    await waitFor(() => expect(state.reorder.mutateAsync).toHaveBeenCalledWith(['e2', 'e1']));
  });

  it('uređivanje otvara sheet sa postojećim događajem', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [event()] };
    render(<TimelineAdminPage />);
    expect(screen.getByText('sheet:false:-')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText('sheet:true:e1')).toBeInTheDocument();
  });

  it('novi događaj otvara prazan sheet', async () => {
    const user = userEvent.setup();
    render(<TimelineAdminPage />);
    await user.click(screen.getByRole('button', { name: 'Novi' }));
    expect(screen.getByText('sheet:true:-')).toBeInTheDocument();
  });

  it('brisanje traži potvrdu sa naslovom događaja i šalje ID', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [event()] };
    render(<TimelineAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith('e1'));
    expect(state.confirm).toHaveBeenCalledWith({
      title: 'Obrisati događaj?', description: '"Osnivanje kluba" će biti obrisan.',
      confirmLabel: 'Obriši', variant: 'danger',
    });
  });

  it('odbijena potvrda ne briše događaj', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    state.list = { ...state.list, data: [event()] };
    render(<TimelineAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });

  it('zatvaranje sheet-a briše odabrani događaj', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [event()] };
    render(<TimelineAdminPage />);
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText('sheet:true:e1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.getByText('sheet:false:-')).toBeInTheDocument();
  });
});
