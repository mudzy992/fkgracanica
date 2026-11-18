import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { useGalleryAdminList } from '../../../hooks/use-content-admin';
import { useNewsList } from '../../../hooks';
import { contentStatusLabel } from '../../../lib/content-status-labels';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { HomeKpiGrid } from './HomeKpiGrid';
import { HomeQuickActions } from './HomeQuickActions';
import { RoleHomeShell } from './RoleHomeShell';

const WRITER_KPI_PERMISSIONS: Record<string, string> = {
  drafts: 'news.manage',
  pending: 'news.manage',
  published: 'news.manage',
  albums: 'gallery.manage',
};

const QUICK_PERMISSIONS: Record<string, string> = {
  '/admin/news/new': 'news.manage',
  '/admin/media': 'media.read',
  '/admin/gallery/new': 'gallery.manage',
  '/admin/gallery': 'gallery.manage',
};

function KpiSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-[118px] border-[var(--border-subtle)] bg-surface/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-3 w-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QueueSkeleton() {
  return (
    <ul
      className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]"
      aria-busy="true"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        </li>
      ))}
    </ul>
  );
}

export function WriterHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const perms = user?.permissions;

  const enabledNews = hasPermission(perms, 'news.manage');
  const enabledGallery = hasPermission(perms, 'gallery.manage');

  const drafts = useNewsList('DRAFT', undefined, { enabled: enabledNews });
  const pending = useNewsList('PENDING', undefined, { enabled: enabledNews });
  const published = useNewsList('PUBLISHED', undefined, { enabled: enabledNews });
  const albums = useGalleryAdminList({ enabled: enabledGallery });

  const isKpiLoading =
    drafts.isLoading || pending.isLoading || published.isLoading || albums.isLoading;
  const isKpiError = drafts.isError || pending.isError || published.isError || albums.isError;
  const isKpiFetching =
    drafts.isFetching || pending.isFetching || published.isFetching || albums.isFetching;
  const kpiUpdatedAt = Math.max(
    drafts.dataUpdatedAt ?? 0,
    pending.dataUpdatedAt ?? 0,
    published.dataUpdatedAt ?? 0,
    albums.dataUpdatedAt ?? 0,
  );

  const queue = [...(drafts.data ?? []), ...(pending.data ?? [])].slice(0, 8);
  const isQueueLoading = drafts.isLoading || pending.isLoading;
  const isQueueError = drafts.isError || pending.isError;
  const queueFetching = drafts.isFetching || pending.isFetching;

  const handleRetryKpi = () => {
    void drafts.refetch();
    void pending.refetch();
    void published.refetch();
    void albums.refetch();
  };
  const handleRetryQueue = () => {
    void drafts.refetch();
    void pending.refetch();
  };

  const lastUpdated = kpiUpdatedAt
    ? new Date(kpiUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const kpiItems = [
    {
      key: 'drafts',
      label: t('admin.content.drafts'),
      value: drafts.data?.length ?? 0,
      href: hasPermission(perms, WRITER_KPI_PERMISSIONS.drafts) ? '/admin/news' : undefined,
      hint: t('admin.content.draftsHint'),
    },
    {
      key: 'pending',
      label: t('admin.content.pending'),
      value: pending.data?.length ?? 0,
      href: hasPermission(perms, WRITER_KPI_PERMISSIONS.pending) ? '/admin/news' : undefined,
      hint: t('admin.content.pendingHint'),
    },
    {
      key: 'published',
      label: t('admin.content.published'),
      value: published.data?.length ?? 0,
      href: hasPermission(perms, WRITER_KPI_PERMISSIONS.published) ? '/admin/news' : undefined,
      hint: t('admin.content.publishedHint'),
    },
    {
      key: 'albums',
      label: t('admin.content.albums'),
      value: albums.data?.length ?? 0,
      href: hasPermission(perms, WRITER_KPI_PERMISSIONS.albums) ? '/admin/gallery' : undefined,
      hint: t('admin.gallery'),
    },
  ];

  const quickItems = [
    { to: '/admin/news/new', label: t('admin.content.newNews'), variant: 'default' as const },
    { to: '/admin/media', label: t('admin.content.mediaFolders') },
    { to: '/admin/gallery/new', label: t('admin.content.newAlbum') },
    { to: '/admin/gallery', label: t('admin.gallery') },
  ].filter((a) => hasPermission(perms, QUICK_PERMISSIONS[a.to] ?? ''));

  return (
    <RoleHomeShell
      seo="Writer"
      title={t('admin.home.writerTitle')}
      hint={t('admin.home.writerHint')}
    >
      {isKpiError ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-text-muted">{t('admin.home.kpiError')}</p>
          <Button variant="outline" onClick={handleRetryKpi} disabled={isKpiFetching}>
            {isKpiFetching ? t('admin.common.loading') : t('actions.retry')}
          </Button>
        </div>
      ) : isKpiLoading ? (
        <KpiSkeletonGrid count={4} />
      ) : (
        <HomeKpiGrid items={kpiItems} />
      )}

      {quickItems.length > 0 ? <HomeQuickActions items={quickItems} /> : null}

      {lastUpdated ? (
        <div className="mt-6 flex items-center gap-3 text-xs text-text-muted">
          <span>
            {t('admin.home.lastUpdated', {
              defaultValue: 'Ažurirano u {{time}}',
              time: lastUpdated,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void drafts.refetch();
              void pending.refetch();
              void published.refetch();
              void albums.refetch();
            }}
            disabled={isKpiFetching || queueFetching}
          >
            {isKpiFetching || queueFetching
              ? t('admin.common.loading')
              : t('admin.home.refresh', { defaultValue: 'Osvježi' })}
          </Button>
        </div>
      ) : null}

      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">
        {t('admin.content.unpublishedNews')}
      </h2>
      {isQueueError ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-text-muted">{t('admin.home.kpiError')}</p>
          <Button variant="outline" onClick={handleRetryQueue} disabled={queueFetching}>
            {queueFetching ? t('admin.common.loading') : t('actions.retry')}
          </Button>
        </div>
      ) : isQueueLoading ? (
        <QueueSkeleton />
      ) : (
        <ul
          className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]"
          aria-label={t('admin.content.queueLabel', { defaultValue: 'Red čekanja' })}
        >
          {queue.length === 0 ? (
            <li className="px-4 py-6 text-sm text-text-muted">{t('admin.content.noDrafts')}</li>
          ) : (
            queue.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/admin/news/${item.id}/edit`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-surface/80"
                >
                  <span className="truncate font-medium">{item.title}</span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {contentStatusLabel(item.status)}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </RoleHomeShell>
  );
}
