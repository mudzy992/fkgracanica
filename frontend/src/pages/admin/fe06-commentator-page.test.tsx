import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorPage } from './CommentatorPage';

const state = vi.hoisted(() => ({
  match: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  realtime: [] as (string | undefined)[],
  seo: [] as (string | undefined)[],
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
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}));
vi.mock('../../components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('./commentator/CommentatorControls', () => ({
  CommentatorControls: ({ match }: { match: unknown }) => {
    state.controls.push(match);
    return <div data-testid="controls" />;
  },
}));
vi.mock('./commentator/CommentatorDeskHeader', () => ({
  CommentatorDeskHeader: (props: unknown) => {
    state.header.push(props);
    return <header data-testid="desk-header" />;
  },
}));

const match = (over: Record<string, unknown> = {}) => ({ id: 'm1', status: 'LIVE', ...over });

const LocationProbe = () => {
  const location = useLocation();
  state.path = location.pathname;
  return null;
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/admin/live/m1']}>
      <LocationProbe />
      <Routes>
        <Route path="/admin/live/:id" element={<CommentatorPage />} />
        <Route path="*" element={<p>druga</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('CommentatorPage', () => {
  beforeEach(() => {
    state.match = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    state.realtime = [];
    state.seo = [];
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

  it('bez podataka prikazuje da utakmica nije nađena', () => {
    renderPage();
    expect(screen.getByText('admin.matchReport.notFound')).toBeTruthy();
  });

  it('završena utakmica preusmjerava na izvještaj', () => {
    state.match = { data: match({ status: 'FINISHED' }), isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(state.path).toBe('/admin/matches/m1/report');
    expect(screen.queryByTestId('controls')).toBeNull();
  });

  it('live utakmica prikazuje zaglavlje, SEO i kontrole', () => {
    const data = match();
    state.match = { data, isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(state.seo).toContain('admin.commentatorPage.title');
    expect(state.header[0]).toEqual(
      expect.objectContaining({
        match: data,
        title: 'admin.commentatorPage.panel',
        publicHref: '/live/m1',
        publicLabel: 'admin.commentatorPage.publicLive',
      }),
    );
    expect(state.controls[0]).toBe(data);
  });

  it('realtime pretplata koristi ID iz URL-a', () => {
    state.match = { data: match(), isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(state.realtime).toContain('m1');
  });
});
