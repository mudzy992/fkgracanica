import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarSeasonPage } from './CalendarSeasonPage';

type Row = Record<string, unknown> & { id: string };

const state = vi.hoisted(() => ({
  seasons: undefined as unknown,
  isLoading: false,
  perms: [] as string[],
  confirm: vi.fn(),
  remove: vi.fn(),
  sheet: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({ useSeasons: () => ({ data: state.seasons, isLoading: state.isLoading }) }));
vi.mock('../../hooks/use-season-admin', () => ({
  useDeleteSeasonCompetition: () => ({ mutateAsync: state.remove }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: ({ title }: { title: string }) => <div>seo:{title}</div> }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const doubles = await import('../../test/doubles/admin-shell-doubles');
  return { AdminDataTable: doubles.AdminDataTableDouble };
});
vi.mock('./SeasonEditionFormSheet', () => ({
  SeasonEditionFormSheet: (props: Record<string, unknown>) => {
    state.sheet = props;
    const edit = props.editEdition as Row | null;
    return (
      <div>
        sheet:{String(props.open)}:{String(edit?.id ?? '-')}:{String(props.seasonId)}
      </div>
    );
  },
}));

const edition = (over: Record<string, unknown> = {}) => ({
  id: 'e1',
  competition: { name: 'Kantonalna liga', isLeague: true },
  participants: [{ id: 'p1' }, { id: 'p2' }],
  ...over,
});

const season = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  name: 'Sezona 2025/26',
  yearStart: 2025,
  yearEnd: 2026,
  isActive: true,
  competitions: [edition()],
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/admin/seasons/s1']}>
      <Routes>
        <Route path="/admin/seasons/:seasonId" element={<CalendarSeasonPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.seasons = [season()];
  state.isLoading = false;
  state.perms = ['competitions.manage'];
  state.confirm.mockReset();
  state.confirm.mockResolvedValue(true);
  state.remove.mockReset();
  state.remove.mockResolvedValue({});
  state.sheet = {};
});

describe('CalendarSeasonPage — dozvole i akcije', () => {

  it('bez dozvole nema dugmeta za takmičenje ni akcija u redu', () => {
    state.perms = [];
    renderPage();
    expect(screen.queryByRole('button', { name: /Takmičenje/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
  });

  it('dugme za takmičenje otvara praznu formu', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(state.sheet.open).toBe(false);
    await user.click(screen.getByRole('button', { name: /Takmičenje/ }));
    expect(state.sheet).toMatchObject({ open: true, editEdition: null, seasonId: 's1' });
    expect(screen.getByText('sheet:true:-:s1')).toBeInTheDocument();
  });

  it('izmjena šalje postojeći zapis u formu', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect((state.sheet.editEdition as Row).id).toBe('e1');
    expect(screen.getByText('sheet:true:e1:s1')).toBeInTheDocument();
  });

  it('brisanje traži potvrdu sa nazivom pa uklanja iz sezone', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith({
        title: 'Ukloniti takmičenje iz sezone?',
        description: 'Kantonalna liga',
        variant: 'danger',
        confirmLabel: 'Ukloni',
      }),
    );
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith({ seasonId: 's1', editionId: 'e1' }));
  });

  it('bez naziva takmičenja potvrda koristi id, a odbijanje ne briše', async () => {
    const user = userEvent.setup();
    state.confirm.mockResolvedValue(false);
    state.seasons = [season({ competitions: [{ id: 'e9' }] })];
    renderPage();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() =>
      expect(state.confirm).toHaveBeenCalledWith(expect.objectContaining({ description: 'e9' })),
    );
    expect(state.remove).not.toHaveBeenCalled();
  });
});
