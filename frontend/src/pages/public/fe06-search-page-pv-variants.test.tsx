import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchPage } from './SearchPage';
import { resetSearchState } from '../../test/doubles/search-page-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-search', async () => (await import('../../test/doubles/search-page-doubles')).searchHooksModule());
vi.mock('../../components/search/SearchResultSections', async () => (await import('../../test/doubles/search-page-doubles')).searchResultsModule());
vi.mock('../../components/public/EmptyState', async () => (await import('../../test/doubles/search-page-doubles')).searchEmptyModule());
vi.mock('../../components/common/DataError', async () => (await import('../../test/doubles/search-page-doubles')).searchErrorModule());
vi.mock('../../components/public/PageContainer', async () => {
  const d = await import('../../test/doubles/search-page-doubles');
  return { PageContainer: d.searchShellModules().PageContainer };
});
vi.mock('../../components/public/shell/PageHeroHeader', async () => ({
  PageHeroHeader: (await import('../../test/doubles/search-page-doubles')).searchShellModules().PageHeroHeader,
}));
vi.mock('../../components/public/shell/PremiumCard', async () => ({
  PremiumCard: (await import('../../test/doubles/search-page-doubles')).searchShellModules().PremiumCard,
}));
vi.mock('../../components/seo/Seo', async () => (await import('../../test/doubles/search-page-doubles')).searchSeoModule());
vi.mock('../../components/ui/skeleton', async () => (await import('../../test/doubles/search-page-doubles')).searchSkeletonModule());

function Probe() {
  const loc = useLocation();
  return <span data-testid="loc">{`${loc.pathname}${loc.search}`}</span>;
}

const renderPage = (path = '/pretraga?q=hello&page=5') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
      <SearchPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  resetSearchState();
  // ensure clean window hook
  delete (window as unknown as Record<string, unknown>).__testSearchSet;
});

describe('SearchPage — pv varijante (3 grane)', () => {
  it('next.page definisan koristi direktno pv', async () => {
    renderPage('/pretraga?q=hello&page=5');
    const set = (window as unknown as Record<string, unknown>).__testSearchSet as (n: unknown) => void;
    expect(set).toBeDefined();
    set({ page: 2 });
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('page=2'));
    expect(screen.getByTestId('loc').textContent).toContain('q=hello');
  });

  it('next.page nedefinisan + next.type definisan daje pv=1 bez page param', async () => {
    renderPage('/pretraga?q=hello&page=5');
    const set = (window as unknown as Record<string, unknown>).__testSearchSet as (n: unknown) => void;
    set({ type: 'news' });
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('type=news'));
    // pv=1 ne upisuje page
    expect(screen.getByTestId('loc').textContent).not.toContain('page=');
    expect(screen.getByTestId('loc').textContent).toContain('q=hello');
  });

  it('next.page nedefinisan + next.type nedefinisan daje pv=page', async () => {
    renderPage('/pretraga?q=hello&page=5');
    const set = (window as unknown as Record<string, unknown>).__testSearchSet as (n: unknown) => void;
    set({ q: 'hello' });
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('page=5'));
    expect(screen.getByTestId('loc').textContent).toContain('q=hello');
  });

  it('next.page nedefinisan + next.type null daje pv=1', async () => {
    renderPage('/pretraga?q=hello&page=5');
    const set = (window as unknown as Record<string, unknown>).__testSearchSet as (n: unknown) => void;
    set({ type: null });
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('q=hello'));
    expect(screen.getByTestId('loc').textContent).not.toContain('type=');
    expect(screen.getByTestId('loc').textContent).not.toContain('page=');
  });
});
