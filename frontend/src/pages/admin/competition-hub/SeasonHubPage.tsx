import { buttonVariants } from '../../../components/ui/button-variants';
import { cn } from '../../../lib/utils';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useSeasons } from '../../../hooks';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { findEdition, type CalendarSeason } from '../../../lib/season-utils';
import { Seo } from '../../../components/seo/Seo';
import { AdminBreadcrumbs } from '../../../components/admin/AdminBreadcrumbs';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { RoundMatchesPanel } from './RoundMatchesPanel';
import { SeasonRoundsPanel } from './SeasonRoundsPanel';
import { Card } from '../../../components/ui/card';

function SeasonHubPageSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6 lg:grid-cols-5">
      <Card className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background lg:col-span-2">
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
      <Card className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background lg:col-span-3">
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    </div>
  );
}

export function SeasonHubPage() {
  const { t } = useTranslation();
  const { seasonId = '', editionId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const selectedRoundId = params.get('roundId');
  const { data: seasons, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useSeasons();
  const { user } = useAuth();
  const canManage =
    hasPermission(user?.permissions, 'competitions.manage') ||
    hasPermission(user?.permissions, 'matches.manage');

  const found = findEdition((seasons as CalendarSeason[] | undefined) ?? [], editionId || seasonId);
  const editionKey = found?.edition.id ?? '';
  const backTo = found ? `/admin/seasons/${found.calendar.id}` : '/admin/competitions';

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const showNotFound = !isLoading && !isError && !found;

  return (
    <div className="space-y-6 pb-8">
      <Seo title={found?.edition.competition?.name ?? found?.calendar.name ?? t('admin.seasonHub.title', { defaultValue: 'Sezona' })} />
      <AdminBreadcrumbs
        items={[
          { label: 'Admin', to: '/admin' },
          { label: 'Takmičenja', to: '/admin/competitions' },
          ...(found
            ? [
                { label: found.calendar.name, to: `/admin/seasons/${found.calendar.id}` },
                { label: found.edition.competition?.name ?? found.calendar.name },
              ]
            : []),
        ]}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={backTo}
          aria-label={t('actions.back')}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          {found ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{found.edition.competition?.name ?? 'Takmičenje'}</h1>
                {found.calendar.isActive && (
                  <Badge variant="success">{t('admin.competitionForm.activeSeason')}</Badge>
                )}
                {found.edition.competition?.isLeague && (
                  <Badge variant="success">{t('admin.competitionsAdmin.league')}</Badge>
                )}
              </div>
              <p className="text-sm text-text-muted">
                {found.calendar.name} · {found.calendar.yearStart}/{found.calendar.yearEnd}
              </p>
            </>
          ) : isLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : null}
        </div>
        {lastUpdated ? (
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span>
              {t('admin.home.lastUpdated', {
                defaultValue: 'Ažurirano u {{time}}',
                time: lastUpdated,
              })}
            </span>
            <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? t('admin.common.loading') : t('admin.home.refresh', { defaultValue: 'Osvježi' })}
            </Button>
          </div>
        ) : null}
      </div>

      {isError ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-text-muted">{t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}</p>
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? t('admin.common.loading') : t('actions.retry', { defaultValue: 'Pokušaj ponovo' })}
          </Button>
        </div>
      ) : isLoading ? (
        <SeasonHubPageSkeleton />
      ) : showNotFound ? (
        <p role="status" className="p-8 text-text-muted">
          {t('admin.seasonHub.notFound')}
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background lg:col-span-2">
            <SeasonRoundsPanel
              seasonId={editionKey}
              selectedRoundId={selectedRoundId}
              onSelectRound={(id) => (id ? setParams({ roundId: id }) : setParams({}))}
              canManage={canManage}
            />
          </Card>
          <Card className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background lg:col-span-3">
            {selectedRoundId ? (
              <RoundMatchesPanel seasonId={editionKey} roundId={selectedRoundId} canManage={canManage} />
            ) : (
              <p role="status" className="p-8 text-center text-sm text-text-muted">
                Odaberite kolo za upravljanje utakmicama.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
