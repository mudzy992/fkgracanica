import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchReportPage } from './MatchReportPage';

const state = vi.hoisted(() => ({
  match: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  realtime: [] as (string | undefined)[],
  seo: [] as (string | undefined)[],
  crumbs: [] as unknown[],
  header: [] as unknown[],
  controls: [] as unknown[],
  path: '',
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({ useMatch: (id: string) => (state.realtime.push(id), state.match) }));
vi.mock('../../hooks/use-match-realtime', () => ({
  useMatchRealtime: (id?: string) => {
    state.realtime.push(id);
  },
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../../components/admin/AdminBreadcrumbs', () => ({
  AdminBreadcrumbs: ({ items }: { items: unknown }) => {
    state.crumbs.push(items);
    return <nav>breadcrumbs</nav>;
  },
}));
vi.mock('../../components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}));
vi.mock('./commentator/CommentatorReportControls', () => ({
  CommentatorReportControls: ({ match }: { match: unknown }) => {
    state.controls.push(match);
    return <div data-testid="report-controls" />;
  },
}));
vi.mock('./commentator/CommentatorDeskHeader', () => ({
  CommentatorDeskHeader: (props: unknown) => {
    state.header.push(props);
    return <header data-testid="desk-header" />;
  },
}));

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'FINISHED',
  reportStatus: 'DRAFT',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  ...over,
});

const LocationProbe = () => {
  const location = useLocation();
  state.path = location.pathname;
  return null;
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/admin/reports/m1']}>
      <LocationProbe />
      <Routes>
        <Route path="/admin/reports/:id" element={<MatchReportPage />} />
        <Route path="*" element={<p>druga-stranica</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('MatchReportPage', () => {
  beforeEach(() => {
    state.match = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    state.realtime = [];
    state.seo = [];
    state.crumbs = [];
    state.header = [];
    state.controls = [];
    state.path = '';
  });

  it('dok se utakmica učitava prikazuje skeleton', () => {
    state.match = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    renderPage();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  it('greška prikazuje poruku i ponovno učitavanje', async () => {
    state.match = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() };
    renderPage();
    expect(screen.getByText('admin.home.matchesError')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(state.match.refetch).toHaveBeenCalled();
  });

  it('bez podataka prikazuje poruku da utakmica nije nađena', () => {
    renderPage();
    expect(screen.getByText('admin.matchReport.notFound')).toBeTruthy();
  });

  it('utakmica koja nije završena preusmjerava na live stranicu', async () => {
    state.match = { data: match({ status: 'LIVE' }), isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(state.path).toBe('/admin/live/m1');
    expect(screen.queryByTestId('report-controls')).toBeNull();
  });

  it('odobren izvještaj je zaključan uz link na javnu utakmicu', () => {
    state.match = {
      data: match({ reportStatus: 'APPROVED' }),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    expect(screen.getByText('admin.matchReport.approvedLocked')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Detalji utakmice' }).getAttribute('href')).toBe('/utakmice/m1');
    expect(screen.queryByTestId('report-controls')).toBeNull();
  });

  it('izvještaj u izradi prikazuje zaglavlje, breadcrumbs i kontrole', () => {
    const data = match();
    state.match = { data, isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(state.seo).toContain('admin.matchReport.title');
    expect(state.crumbs[0]).toEqual([
      { label: 'Admin', to: '/admin' },
      { label: 'Takmičenja', to: '/admin/competitions' },
      { label: 'Izvještaj: FK Gračanica – FK Slavija' },
    ]);
    expect(state.header[0]).toEqual(
      expect.objectContaining({
        match: data,
        title: 'admin.matchReport.title',
        publicHref: '/utakmice/m1',
        publicLabel: 'Javni prikaz',
      }),
    );
    expect(state.controls[0]).toBe(data);
  });

  it('nedostajući klubovi u breadcrumbsu daju zamjenske nazive', () => {
    state.match = {
      data: match({ homeClub: null, awayClub: null }),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    expect(state.crumbs[0]).toEqual(
      expect.arrayContaining([{ label: 'Izvještaj: Domaćin – Gost' }]),
    );
  });

  it('realtime pretplata koristi ID iz URL-a', () => {
    state.match = { data: match(), isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(state.realtime).toContain('m1');
  });
});
