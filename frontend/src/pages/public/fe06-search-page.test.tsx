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

const input = () => screen.getByPlaceholderText('pages.search.placeholder');

beforeEach(() => {
  resetSearchState();
});

describe('SearchPage — stanja', () => {
  it('manje od dva znaka prikazuje uputu i ne traži rezultate', () => {
    renderPage('/pretraga?q=a');
    expect(screen.getByText('prazno:pages.search.minChars')).toBeInTheDocument();
    expect(state.calls.at(-1)).toMatchObject({ q: 'a', page: 1 });
  });

  it('učitavanje prikazuje skeleton', () => {
    state.result = { data: undefined, isLoading: true };
    renderPage('/pretraga?q=ana');
    expect(screen.getByText('skeleton')).toBeInTheDocument();
  });

  it('greška nudi ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.result = { data: undefined, isError: true };
    renderPage('/pretraga?q=ana');
    await user.click(screen.getByRole('button', { name: 'retry' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(state.calls.at(-1)).toMatchObject({ q: 'ana' });
  });

  it('SEO nosi upit kad postoji', () => {
    renderPage('/pretraga?q=ana marija');
    expect(state.seo).toMatchObject({ url: '/pretraga?q=ana%20marija' });
    expect(state.seo.title).toBe('pages.search.seoTitle');
  });

  it('bez upita SEO pokazuje čistu putanju', () => {
    renderPage();
    expect(state.seo).toMatchObject({ url: '/pretraga' });
  });

  it('prazni rezultati daju poruku bez sekcija', () => {
    state.result = { data: searchData({ news: [], clubs: [] }) };
    renderPage('/pretraga?q=ana');
    expect(screen.getByText('prazno:pages.search.empty')).toBeInTheDocument();
    expect(screen.queryByText('rezultati:svi')).toBeNull();
  });
});

describe('SearchPage — polje za pretragu', () => {
  it('slanje forme upisuje q i briše fasetu i stranicu', async () => {
    const user = userEvent.setup();
    renderPage('/pretraga?q=ana&type=news&page=3');
    await user.clear(input());
    await user.type(input(), 'bora');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('/pretraga?q=bora'));
  });

  it('promjena q u URL-u ažurira polje', async () => {
    const user = userEvent.setup();
    renderPage('/pretraga?q=ana');
    expect(input()).toHaveValue('ana');
    await user.click(screen.getByRole('button', { name: 'idi-na-boru' }));
    await waitFor(() => expect(input()).toHaveValue('bora'));
  });
});
