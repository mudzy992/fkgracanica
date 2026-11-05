import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchPage } from './SearchPage';
import {
  searchData,
  resetSearchState,
  searchState as state,
} from '../../test/doubles/search-page-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-search', async () =>
  (await import('../../test/doubles/search-page-doubles')).searchHooksModule(),
);
vi.mock('../../components/search/SearchResultSections', async () =>
  (await import('../../test/doubles/search-page-doubles')).searchResultsModule(),
);
vi.mock('../../components/public/EmptyState', async () =>
  (await import('../../test/doubles/search-page-doubles')).searchEmptyModule(),
);
vi.mock('../../components/common/DataError', async () =>
  (await import('../../test/doubles/search-page-doubles')).searchErrorModule(),
);
vi.mock('../../components/public/PageContainer', async () => {
  const doubles = await import('../../test/doubles/search-page-doubles');
  return { PageContainer: doubles.searchShellModules().PageContainer };
});
vi.mock('../../components/public/shell/PageHeroHeader', async () => ({
  PageHeroHeader: (await import('../../test/doubles/search-page-doubles')).searchShellModules()
    .PageHeroHeader,
}));
vi.mock('../../components/public/shell/PremiumCard', async () => ({
  PremiumCard: (await import('../../test/doubles/search-page-doubles')).searchShellModules()
    .PremiumCard,
}));
vi.mock('../../components/seo/Seo', async () =>
  (await import('../../test/doubles/search-page-doubles')).searchSeoModule(),
);
vi.mock('../../components/ui/skeleton', async () =>
  (await import('../../test/doubles/search-page-doubles')).searchSkeletonModule(),
);

const renderPage = (path = '/pretraga') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SearchProbe />
      <SearchPage />
    </MemoryRouter>,
  );


function SearchProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div>
      <span data-testid="loc">{`${location.pathname}${location.search}`}</span>
      <button onClick={() => navigate('/pretraga?q=bora')}>idi-na-boru</button>
    </div>
  );
}

beforeEach(() => {
  resetSearchState();
});

describe('SearchPage — fasete', () => {
  it('prikazuje fasete samo sa rezultatima i sekciju rezultata', () => {
    renderPage('/pretraga?q=ana');
    expect(screen.getByText('Vijesti (3)')).toBeInTheDocument();
    expect(screen.getByText('Klubovi (1)')).toBeInTheDocument();
    expect(screen.queryByText(/Igrači/)).toBeNull();
    expect(screen.getByText('rezultati:svi')).toBeInTheDocument();
  });

  it('izbor fasete upisuje type i vraća na prvu stranicu', async () => {
    const user = userEvent.setup();
    renderPage('/pretraga?q=ana&page=2');
    await user.click(screen.getByRole('button', { name: 'Vijesti (3)' }));
    await waitFor(() =>
      expect(screen.getByTestId('loc')).toHaveTextContent('/pretraga?q=ana&type=news'),
    );
    expect(screen.getByText('rezultati:news')).toBeInTheDocument();
  });

  it('dugme Svi uklanja fasetu', async () => {
    const user = userEvent.setup();
    renderPage('/pretraga?q=ana&type=clubs');
    await user.click(screen.getByRole('button', { name: 'pages.search.all' }));
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('/pretraga?q=ana'));
  });
});

describe('SearchPage — paginacija', () => {
  it('skrivena je bez fasete i kad ima samo jedna stranica', () => {
    state.result = { data: searchData({ meta: { total: 40, page: 1, limit: 20, totalPages: 2 } }) };
    renderPage('/pretraga?q=ana');
    expect(screen.queryByRole('button', { name: 'pages.search.next' })).toBeNull();
  });

  it('naprijed i nazad mijenjaju page parametar', async () => {
    const user = userEvent.setup();
    state.result = { data: searchData({ meta: { total: 60, page: 2, limit: 20, totalPages: 3 } }) };
    renderPage('/pretraga?q=ana&type=news&page=2');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'pages.search.next' }));
    await waitFor(() =>
      expect(screen.getByTestId('loc')).toHaveTextContent('q=ana&type=news&page=3'),
    );
    await user.click(screen.getByRole('button', { name: 'pages.search.previous' }));
    await waitFor(() =>
      expect(screen.getByTestId('loc')).toHaveTextContent('q=ana&type=news&page=2'),
    );
  });

  it('na prvoj stranici je nazad onemogućeno', () => {
    state.result = { data: searchData({ meta: { total: 40, page: 1, limit: 20, totalPages: 2 } }) };
    renderPage('/pretraga?q=ana&type=news');
    expect(screen.getByRole('button', { name: 'pages.search.previous' })).toBeDisabled();
  });
});
