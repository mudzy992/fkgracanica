import { useTranslation } from 'react-i18next';
import { Seo } from '../../../components/seo/Seo';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { usePlatformStatus } from '../../../hooks/use-platform-status';
import { GROUP_KEYS } from './group-meta';
import { PlatformStatusHero } from './PlatformStatusHero';
import { StatusGroupCard } from './StatusGroupCard';

function PlatformStatusPageSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6">
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}

export function PlatformStatusPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const enabled = hasPermission(user?.permissions, 'dashboard.read');
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } =
    usePlatformStatus({ enabled });

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      <Seo title={t('admin.stanje')} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">{t('admin.stanje')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">{t('admin.stanjeHint')}</p>
        {lastUpdated ? (
          <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
            <span>
              {t('admin.home.lastUpdated', {
                defaultValue: 'Ažurirano u {{time}}',
                time: lastUpdated,
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching
                ? t('admin.common.loading')
                : t('admin.home.refresh', { defaultValue: 'Osvježi' })}
            </Button>
          </div>
        ) : null}
      </div>

      {isError ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-12">
          <p className="text-text-muted">{t('admin.stanjeError')}</p>
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? t('admin.common.loading') : t('admin.stanjeRetry')}
          </Button>
        </div>
      ) : isLoading || !data ? (
        <PlatformStatusPageSkeleton />
      ) : (
        <div className="space-y-6">
          <PlatformStatusHero data={data} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {GROUP_KEYS.map(({ badge, labelKey }) => (
              <StatusGroupCard
                key={badge}
                label={t(labelKey)}
                modules={data.modules.filter((m) => m.badge === badge)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
