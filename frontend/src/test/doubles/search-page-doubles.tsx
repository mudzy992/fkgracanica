import { vi } from 'vitest';

/** Zajedničko stanje i dvojnici za SearchPage testove (dva fajla). */
export const searchState = {
  result: {} as Record<string, unknown>,
  calls: [] as Array<Record<string, unknown>>,
  seo: {} as Record<string, unknown>,
  refetch: vi.fn(),
};

export const searchFacets = {
  news: 3,
  players: 0,
  clubs: 1,
  matches: 0,
  galleries: 0,
  trophies: 0,
  timeline: 0,
  hallOfFame: 0,
};

export const searchData = (over: Record<string, unknown> = {}) => ({
  facets: searchFacets,
  news: [{ id: 'n1' }],
  players: [],
  clubs: [],
  matches: [],
  galleries: [],
  trophies: [],
  timeline: [],
  hallOfFame: [],
  ...over,
});

export function resetSearchState() {
  searchState.result = { data: searchData() };
  searchState.calls = [];
  searchState.seo = {};
  searchState.refetch.mockClear();
}

export function searchHooksModule() {
  return {
    useSearch: (params: Record<string, unknown>) => {
      searchState.calls.push(params);
      return {
        data: searchState.result.data,
        isLoading: searchState.result.isLoading ?? false,
        isError: searchState.result.isError ?? false,
        refetch: searchState.refetch,
      };
    },
  };
}

export function searchResultsModule() {
  return {
    SearchResultSections: ({ type }: { type?: string }) => <div>rezultati:{type ?? 'svi'}</div>,
  };
}

export function searchEmptyModule() {
  return { EmptyState: ({ message }: { message: string }) => <div>prazno:{message}</div> };
}

export function searchErrorModule() {
  return {
    DataError: ({ onRetry }: { onRetry: () => void }) => (
      <div>
        greška-pretrage
        <button onClick={onRetry}>retry</button>
      </div>
    ),
  };
}

export function searchShellModules() {
  return {
    PageContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PageHeroHeader: () => <div>hero-pretrage</div>,
    PremiumCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
}

export function searchSeoModule() {
  return {
    Seo: (props: Record<string, unknown>) => {
      searchState.seo = props;
      return <div>seo</div>;
    },
  };
}

export function searchSkeletonModule() {
  return { Skeleton: () => <div>skeleton</div> };
}
