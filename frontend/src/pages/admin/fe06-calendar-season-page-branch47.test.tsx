import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
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
vi.mock('../../hooks/use-season-admin', () => ({ useDeleteSeasonCompetition: () => ({ mutateAsync: state.remove }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));
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
        <button onClick={() => (props.onOpenChange as (o: boolean) => void)(true)}>otvori-sheet</button>
        <button onClick={() => (props.onOpenChange as (o: boolean) => void)(false)}>zatvori-sheet</button>
      </div>
    );
  },
}));

const edition = (over: Record<string, unknown> = {}) => ({
  id: 'e1', competition: { name: 'Kantonalna liga', isLeague: true }, participants: [{ id: 'p1' }], ...over,
});
const season = (over: Record<string, unknown> = {}) => ({
  id: 's1', name: 'Sezona 2025/26', yearStart: 2025, yearEnd: 2026, isActive: true, competitions: [edition()], ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/admin/seasons/s1']}>
      <Routes><Route path="/admin/seasons/:seasonId" element={<CalendarSeasonPage />} /></Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.seasons = [season()];
  state.isLoading = false;
  state.perms = ['competitions.manage'];
  state.confirm.mockReset(); state.confirm.mockResolvedValue(true);
  state.remove.mockReset(); state.remove.mockResolvedValue({});
  state.sheet = {};
});

describe('CalendarSeasonPage — branch47 (2 grane ?? i if !o)', () => {
  it('seasons ?? [] fallback kada je seasons undefined prikazuje seasonNotFound', () => {
    state.seasons = undefined;
    renderPage();
    expect(screen.getByText('admin.calendar.seasonNotFound')).toBeInTheDocument();
  });

  it('seasons definisano koristi pronađenu sezonu', () => {
    renderPage();
    expect(screen.getByText('Sezona 2025/26')).toBeInTheDocument();
  });

  it('otvaranje sheet-a ne briše edit (if !o false grana)', async () => {
    const user = userEvent.setup();
    renderPage();
    // prvo otvori edit
    await user.click(within(screen.getByTestId('row-e1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:e1/)).toBeInTheDocument();
    // zatvori pa otvori ponovo da testiramo !o false
    await user.click(screen.getByRole('button', { name: 'zatvori-sheet' }));
    expect(screen.getByText(/sheet:false:-/)).toBeInTheDocument();
    // postavi edit ponovo
    await user.click(within(screen.getByTestId('row-e1')).getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText(/sheet:true:e1/)).toBeInTheDocument();
    // pozovi onOpenChange(true) direktno - ne bi trebao obrisati edit
    await user.click(screen.getByRole('button', { name: 'otvori-sheet' }));
    expect(screen.getByText(/sheet:true:e1/)).toBeInTheDocument();
  });
});
