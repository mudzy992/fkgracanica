import { useTranslation } from 'react-i18next';
import { Seo } from '../../../components/seo/Seo';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { usePlatformStatus } from '../../../hooks/use-platform-status';
import { GROUP_KEYS } from './group-meta';
import { PlatformStatusHero } from './PlatformStatusHero';
import { StatusGroupCard } from './StatusGroupCard';

export function PlatformStatusPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = usePlatformStatus();

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-text-muted">{t('admin.stanjeError')}</p>
        <Button variant="outline" onClick={() => void refetch()}>
          {t('admin.stanjeRetry')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Seo title={t('admin.stanje')} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">{t('admin.stanje')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">{t('admin.stanjeHint')}</p>
      </div>
      {isLoading || !data ? (
        <Skeleton className="h-40 w-full" />
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
