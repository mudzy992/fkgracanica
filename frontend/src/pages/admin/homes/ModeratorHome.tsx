import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { useGalleryList, useNewsList } from '../../../hooks';
import { useContactMessages } from '../../../hooks/use-contact-admin';
import { useApproveMatchReport, usePendingLiveReports } from '../../../hooks/use-live-admin';
import { useUpdateGalleryStatus } from '../../../hooks/use-content-admin';
import { useUpdateNewsStatus } from '../../../hooks/use-news-admin';
import { useVisitorTotals } from '../../../hooks/use-analytics';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { HomeKpiGrid } from './HomeKpiGrid';
import { RoleHomeShell } from './RoleHomeShell';
import { matchTitle } from './commentator-desk';
import { runAction } from '../../../lib/action-errors';

const MODERATOR_KPI_PERMISSIONS: Record<string, string> = {
  news: 'news.manage',
  gallery: 'gallery.manage',
  live: 'live.approve',
  inbox: 'contact.read',
  visitorsWeb: 'analytics.read',
  visitorsMobile: 'analytics.read',
  visitorsTotal: 'analytics.read',
};

const QUICK_PERMISSIONS: Record<string, string> = {
  '/admin/news': 'news.manage',
  '/admin/gallery': 'gallery.manage',
  '/admin/live/pending': 'live.approve',
  '/admin/comms': 'contact.read',
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

export function ModeratorHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const perms = user?.permissions;

  const enabledNews = hasPermission(perms, 'news.manage');
  const enabledGallery = hasPermission(perms, 'gallery.manage');
  const enabledLive = hasPermission(perms, 'live.approve');
  const enabledInbox = hasPermission(perms, 'contact.read');
  const enabledVisitors = hasPermission(perms, 'analytics.read');

  const news = useNewsList('PENDING', undefined, { enabled: enabledNews });
  const gallery = useGalleryList('PENDING', { enabled: enabledGallery });
  const live = usePendingLiveReports({ enabled: enabledLive });
  const inbox = useContactMessages({ unreadOnly: true }, { enabled: enabledInbox });
  const visitors = useVisitorTotals(30, { enabled: enabledVisitors });

  const publishNews = useUpdateNewsStatus();
  const publishGallery = useUpdateGalleryStatus();
  const approveLive = useApproveMatchReport();

  const isKpiLoading = news.isLoading || gallery.isLoading || live.isLoading || inbox.isLoading;
  const isKpiError = news.isError || gallery.isError || live.isError || inbox.isError;
  const isKpiFetching = news.isFetching || gallery.isFetching || live.isFetching || inbox.isFetching;
  const kpiUpdatedAt = Math.max(
    news.dataUpdatedAt ?? 0,
    gallery.dataUpdatedAt ?? 0,
    live.dataUpdatedAt ?? 0,
    inbox.dataUpdatedAt ?? 0,
  );

  const isVisitorsLoading = visitors.isLoading;
  const isVisitorsError = visitors.isError;
  const visitorsUpdatedAt = visitors.dataUpdatedAt ?? 0;

  const unread = inbox.data?.meta.total ?? 0;
  const queue = [
    ...(news.data ?? [])
      .slice(0, 4)
      .map((n) => ({ id: n.id, kind: 'news' as const, title: n.title })),
    ...(gallery.data ?? [])
      .slice(0, 3)
      .map((g) => ({ id: g.id, kind: 'gallery' as const, title: g.title })),
    ...(live.data ?? [])
      .slice(0, 3)
      .map((m) => ({ id: m.id, kind: 'live' as const, title: matchTitle(m) })),
  ].slice(0, 8);

  const isQueueLoading = news.isLoading || gallery.isLoading || live.isLoading;
  const isQueueError = news.isError || gallery.isError || live.isError;
  const queueFetching = news.isFetching || gallery.isFetching || live.isFetching;

  const canApproveNews = hasPermission(perms, 'news.approve');
  const canApproveGallery = hasPermission(perms, 'gallery.approve');
  const canApproveLive = hasPermission(perms, 'live.approve');
  const isApproving = publishNews.isPending || publishGallery.isPending || approveLive.isPending;

  const approve = (item: (typeof queue)[number]) => {
    if (item.kind === 'news') void runAction(publishNews.mutateAsync({ id: item.id, status: 'PUBLISHED' }));
    if (item.kind === 'gallery')
      void runAction(publishGallery.mutateAsync({ id: item.id, status: 'PUBLISHED' }));
    if (item.kind === 'live') void runAction(approveLive.mutateAsync(item.id));
  };

  const handleRetryKpi = () => {
    void news.refetch();
    void gallery.refetch();
    void live.refetch();
    void inbox.refetch();
  };
  const handleRetryVisitors = () => void visitors.refetch();
  const handleRetryQueue = () => {
    void news.refetch();
    void gallery.refetch();
    void live.refetch();
  };

  const lastUpdated = kpiUpdatedAt
    ? new Date(kpiUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const kpiItems = [
    {
      key: 'news',
      label: t('admin.content.news'),
      value: news.data?.length ?? 0,
      href: hasPermission(perms, MODERATOR_KPI_PERMISSIONS.news) ? '/admin/news' : undefined,
      hint: t('admin.content.pending'),
    },
    {
      key: 'gallery',
      label: t('admin.content.galleries'),
      value: gallery.data?.length ?? 0,
      href: hasPermission(perms, MODERATOR_KPI_PERMISSIONS.gallery) ? '/admin/gallery' : undefined,
      hint: t('admin.content.pending'),
    },
    {
      key: 'live',
      label: t('admin.content.liveReports'),
      value: live.data?.length ?? 0,
      href: hasPermission(perms, MODERATOR_KPI_PERMISSIONS.live) ? '/admin/live/pending' : undefined,
      hint: t('admin.content.afterMatch'),
    },
    {
      key: 'inbox',
      label: t('admin.commsInbox'),
      value: unread,
      href: hasPermission(perms, MODERATOR_KPI_PERMISSIONS.inbox) ? '/admin/comms' : undefined,
      hint: t('admin.content.unread'),
    },
  ];

  const visitorItems = [
    {
      key: 'visitorsWeb',
      label: t('admin.visitors.web'),
      value: visitors.data?.web ?? 0,
      href: hasPermission(perms, MODERATOR_KPI_PERMISSIONS.visitorsWeb) ? '/admin/analytics' : undefined,
      hint: t('admin.visitors.uniqueVisitors'),
    },
    {
      key: 'visitorsMobile',
      label: t('admin.visitors.mobile'),
      value: visitors.data?.mobile ?? 0,
      href: hasPermission(perms, MODERATOR_KPI_PERMISSIONS.visitorsMobile)
        ? '/admin/analytics'
        : undefined,
      hint: t('admin.visitors.uniqueVisitors'),
    },
    {
      key: 'visitorsTotal',
      label: t('admin.visitors.total'),
      value: visitors.data?.total ?? 0,
      href: hasPermission(perms, MODERATOR_KPI_PERMISSIONS.visitorsTotal) ? '/admin/analytics' : undefined,
      hint: t('admin.visitors.webMobile'),
    },
  ];

  const quickItems = [
    { to: '/admin/news', label: t('admin.content.newsQueue'), variant: 'default' as const },
    { to: '/admin/gallery', label: t('admin.content.galleryQueue') },
    { to: '/admin/live/pending', label: t('admin.livePending') },
    { to: '/admin/comms', label: t('admin.commsInbox') },
  ].filter((a) => hasPermission(perms, QUICK_PERMISSIONS[a.to] ?? ''));

  return (
    <RoleHomeShell
      seo="Moderator"
      title={t('admin.home.moderatorTitle')}
      hint={t('admin.home.moderatorHint')}
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

      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">{t('admin.visitors.title')}</h2>
      {isVisitorsError ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-text-muted">{t('admin.home.kpiError')}</p>
          <Button variant="outline" onClick={handleRetryVisitors} disabled={visitors.isFetching}>
            {visitors.isFetching ? t('admin.common.loading') : t('actions.retry')}
          </Button>
        </div>
      ) : isVisitorsLoading ? (
        <KpiSkeletonGrid count={3} />
      ) : (
        <HomeKpiGrid items={visitorItems} />
      )}

      {quickItems.length > 0 ? (
        <nav aria-label={t('admin.home.quickActions')} className="mt-6">
          <div className="flex flex-wrap gap-1.5">
            {quickItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex h-8 items-center rounded-md border border-[var(--border-subtle)] bg-surface px-3 text-sm font-medium hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}

      {lastUpdated || visitorsUpdatedAt ? (
        <div className="mt-6 flex items-center gap-3 text-xs text-text-muted">
          <span>
            {t('admin.home.lastUpdated', {
              defaultValue: 'Ažurirano u {{time}}',
              time: lastUpdated ?? new Date(visitorsUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void news.refetch();
              void gallery.refetch();
              void live.refetch();
              void inbox.refetch();
              void visitors.refetch();
            }}
            disabled={isKpiFetching || visitors.isFetching}
          >
            {isKpiFetching || visitors.isFetching ? t('admin.common.loading') : t('admin.home.refresh', { defaultValue: 'Osvježi' })}
          </Button>
        </div>
      ) : null}

      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">{t('admin.content.pending')}</h2>
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
            <li className="px-4 py-6 text-sm text-text-muted">{t('admin.content.emptyQueue')}</li>
          ) : (
            queue.map((item) => {
              const canApprove =
                item.kind === 'news'
                  ? canApproveNews
                  : item.kind === 'gallery'
                    ? canApproveGallery
                    : canApproveLive;
              return (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <Link
                    to={
                      item.kind === 'live'
                        ? `/admin/live/${item.id}`
                        : item.kind === 'news'
                          ? `/admin/news/${item.id}/edit`
                          : `/admin/gallery/${item.id}/edit`
                    }
                    className="min-w-0 truncate text-sm font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => approve(item)}
                    disabled={!canApprove || isApproving}
                    aria-label={t('admin.content.approveLabel', { defaultValue: 'Odobri {{title}}', title: item.title })}
                  >
                    {t('admin.content.approve')}
                  </Button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </RoleHomeShell>
  );
}
