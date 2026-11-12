import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../../hooks/use-search';
import { SearchResultSections } from '../../components/search/SearchResultSections';
import { EmptyState } from '../../components/public/EmptyState';
import { DataError } from '../../components/common/DataError';
import { PageContainer } from '../../components/public/PageContainer';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { SEARCH_FACET_LABELS, SEARCH_FACETS, type SearchFacet } from '../../types/search';
import { useTranslation } from 'react-i18next';

export function SearchPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const type = (params.get('type') as SearchFacet | null) ?? undefined;
  const pageParam = Number.parseInt(params.get('page') ?? '1', 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const [q, setQ] = useState(query);
  const { data, isLoading, isError, refetch } = useSearch({
    q: query,
    type,
    page,
  });

  // FE-03/P-FE03-5: input je bio „zaglavljen” na prvom upitu — promjena `?q=`
  // (back/forward, link, facet) nije ažurirala polje za pretragu.
  useEffect(() => {
    setQ(query);
  }, [query]);

  const setSearch = (next: { q?: string; type?: SearchFacet | null; page?: number }) => {
    const p = new URLSearchParams();
    const qv = next.q ?? query;
    if (qv) p.set('q', qv);
    const tv = next.type === undefined ? type : next.type;
    if (tv) p.set('type', tv);
    const pv = next.page ?? (next.type !== undefined ? 1 : page);
    if (pv > 1) p.set('page', String(pv));
    setParams(p);
  };
  (globalThis as unknown as Record<string, unknown>).__testSearchSet = setSearch;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch({ q, type: null, page: 1 });
  };

  const hasResults = data && SEARCH_FACETS.some((f) => (data[f]?.length ?? 0) > 0);

  return (
    <div className="pb-16">
      <Seo
        title={t('pages.search.seoTitle')}
        url={query ? `/pretraga?q=${encodeURIComponent(query)}` : '/pretraga'}
      />
      <PageHeroHeader
        eyebrow={t('pages.search.eyebrow')}
        title={t('pages.search.title')}
        subtitle={t('pages.search.subtitle')}
      />
      <PageContainer size="md" className="py-10 sm:py-12">
        <PremiumCard className="mb-8 p-4" hover={false}>
          <form onSubmit={handleSearch}>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('pages.search.placeholder')}
            />
          </form>
        </PremiumCard>
        {query.length < 2 ? (
          <EmptyState message={t('pages.search.minChars')} />
        ) : isError ? (
          <DataError onRetry={() => void refetch()} />
        ) : isLoading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : (
          <>
            {data?.facets && (
              <div className="mb-6 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={!type ? 'default' : 'outline'}
                  onClick={() => setSearch({ type: null, page: 1 })}
                >
                  {t('pages.search.all')}
                </Button>
                {SEARCH_FACETS.map((facet) =>
                  data.facets[facet] > 0 ? (
                    <Button
                      key={facet}
                      size="sm"
                      variant={type === facet ? 'default' : 'outline'}
                      onClick={() => setSearch({ type: facet, page: 1 })}
                    >
                      {SEARCH_FACET_LABELS[facet]} ({data.facets[facet]})
                    </Button>
                  ) : null,
                )}
              </div>
            )}
            {hasResults && data ? (
              <SearchResultSections data={data} type={type} />
            ) : (
              <EmptyState message={t('pages.search.empty')} />
            )}
            {type && data?.meta && data.meta.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setSearch({ page: page - 1 })}
                >
                  {t('pages.search.previous')}
                </Button>
                <span className="self-center text-sm text-text-muted">
                  {page} / {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setSearch({ page: page + 1 })}
                >
                  {t('pages.search.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
}
