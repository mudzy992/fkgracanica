import { render, screen, within } from '@testing-library/react';
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

const row = (id: string) => screen.getByTestId(`row-${id}`);

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

describe('CalendarSeasonPage — učitavanje i zaglavlje', () => {
  it('dok sezone nisu učitane prikazuje skeleton', () => {
    state.isLoading = true;
    const { container } = renderPage();
    expect(container.querySelector('.h-64')).toBeInTheDocument();
    expect(screen.queryByText('Sezona 2025/26')).toBeNull();
  });

  it('nepoznata sezona daje poruku i ne prikazuje tabelu', () => {
    state.seasons = [season({ id: 'other' })];
    renderPage();
    expect(screen.getByText('admin.calendar.seasonNotFound')).toBeInTheDocument();
  });

  it('prikazuje naziv, raspon godina, aktivnu oznaku i SEO', () => {
    renderPage();
    expect(screen.getByText('Sezona 2025/26')).toBeInTheDocument();
    expect(screen.getByText('2025/2026')).toBeInTheDocument();
    expect(screen.getByText('admin.competitionsAdmin.colActive')).toBeInTheDocument();
    expect(screen.getByText('seo:Sezona 2025/26')).toBeInTheDocument();
  });

  it('neaktivna sezona nema oznaku aktivnosti', () => {
    state.seasons = [season({ isActive: false })];
    renderPage();
    expect(screen.queryByText('admin.competitionsAdmin.colActive')).toBeNull();
  });
});

describe('CalendarSeasonPage — tabela takmičenja', () => {
  it('prikazuje naziv takmičenja, ligu i broj učesnika', () => {
    renderPage();
    expect(within(row('e1')).getByText('Kantonalna liga')).toBeInTheDocument();
    expect(within(row('e1')).getByText('admin.competitionsAdmin.league')).toBeInTheDocument();
    expect(within(row('e1')).getByText('2')).toBeInTheDocument();
    expect(within(row('e1')).getByText('Upravljaj')).toHaveAttribute(
      'href',
      '/admin/seasons/s1/competitions/e1',
    );
  });

  it('takmičenje bez liga oznake dobija oznaku "ostalo"', () => {
    state.seasons = [
      season({ competitions: [edition({ competition: { name: 'Kup', isLeague: false } })] }),
    ];
    renderPage();
    expect(within(row('e1')).getByText('admin.competitionsAdmin.other')).toBeInTheDocument();
  });

  it('nedostajuće takmičenje i učesnici daju crticu i nulu', () => {
    state.seasons = [season({ competitions: [{ id: 'e1' }] })];
    renderPage();
    expect(within(row('e1')).getByText('—')).toBeInTheDocument();
    expect(within(row('e1')).getByText('0')).toBeInTheDocument();
    expect(within(row('e1')).getByText('admin.competitionsAdmin.other')).toBeInTheDocument();
  });

  it('sezona bez takmičenja daje praznu poruku', () => {
    state.seasons = [season({ competitions: [] })];
    renderPage();
    expect(screen.getByText('Nema takmičenja u ovoj sezoni.')).toBeInTheDocument();
  });

  it('sezona bez liste takmičenja takođe je prazna', () => {
    state.seasons = [{ id: 's1', name: 'Sezona 2025/26', yearStart: 2025, yearEnd: 2026 }];
    renderPage();
    expect(screen.getByText('Nema takmičenja u ovoj sezoni.')).toBeInTheDocument();
  });
});
