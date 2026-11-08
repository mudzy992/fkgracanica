import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGalleryList, useNewsList } from '../../../hooks';
import { useContactMessages } from '../../../hooks/use-contact-admin';
import { useApproveMatchReport, usePendingLiveReports } from '../../../hooks/use-live-admin';
import { useUpdateGalleryStatus } from '../../../hooks/use-content-admin';
import { useUpdateNewsStatus } from '../../../hooks/use-news-admin';
import { useVisitorTotals } from '../../../hooks/use-analytics';
import { Button } from '../../../components/ui/button';
import { HomeKpiGrid } from './HomeKpiGrid';
import { HomeQuickActions } from './HomeQuickActions';
import { RoleHomeShell } from './RoleHomeShell';
import { matchTitle } from './commentator-desk';
import { runAction } from '../../../lib/action-errors';

export function ModeratorHome() {
  const { t } = useTranslation();
  const news = useNewsList('PENDING');
  const gallery = useGalleryList('PENDING');
  const live = usePendingLiveReports();
  const inbox = useContactMessages({ unreadOnly: true });
  const publishNews = useUpdateNewsStatus();
  const publishGallery = useUpdateGalleryStatus();
  const approveLive = useApproveMatchReport();
  const visitors = useVisitorTotals(30);
  const loading = news.isLoading || gallery.isLoading || live.isLoading;
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

  const approve = (item: (typeof queue)[number]) => {
    if (item.kind === 'news') void runAction(publishNews.mutateAsync({ id: item.id, status: 'PUBLISHED' }));
    if (item.kind === 'gallery')
      void runAction(publishGallery.mutateAsync({ id: item.id, status: 'PUBLISHED' }));
    if (item.kind === 'live') void runAction(approveLive.mutateAsync(item.id));
  };

  return (
    <RoleHomeShell
      seo="Moderator"
      title={t('admin.home.moderatorTitle')}
      hint={t('admin.home.moderatorHint')}
    >
      <HomeKpiGrid
        items={[
          {
            key: 'news',
            label: t('admin.content.news'),
            value: loading ? '…' : (news.data?.length ?? 0),
            href: '/admin/news',
            hint: t('admin.content.pending'),
          },
          {
            key: 'gallery',
            label: t('admin.content.galleries'),
            value: loading ? '…' : (gallery.data?.length ?? 0),
            href: '/admin/gallery',
            hint: t('admin.content.pending'),
          },
          {
            key: 'live',
            label: t('admin.content.liveReports'),
            value: loading ? '…' : (live.data?.length ?? 0),
            href: '/admin/live/pending',
            hint: t('admin.content.afterMatch'),
          },
          {
            key: 'inbox',
            label: t('admin.commsInbox'),
            value: inbox.isLoading ? '…' : unread,
            href: '/admin/comms',
            hint: t('admin.content.unread'),
          },
        ]}
      />
      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">
        {t('admin.visitors.title')}
      </h2>
      <HomeKpiGrid
        items={[
          {
            key: 'visitorsWeb',
            label: t('admin.visitors.web'),
            value: visitors.isLoading ? '…' : (visitors.data?.web ?? 0),
            href: '/admin/analytics',
            hint: t('admin.visitors.uniqueVisitors'),
          },
          {
            key: 'visitorsMobile',
            label: t('admin.visitors.mobile'),
            value: visitors.isLoading ? '…' : (visitors.data?.mobile ?? 0),
            href: '/admin/analytics',
            hint: t('admin.visitors.uniqueVisitors'),
          },
          {
            key: 'visitorsTotal',
            label: t('admin.visitors.total'),
            value: visitors.isLoading ? '…' : (visitors.data?.total ?? 0),
            href: '/admin/analytics',
            hint: t('admin.visitors.webMobile'),
          },
        ]}
      />
      <HomeQuickActions
        items={[
          { to: '/admin/news', label: t('admin.content.newsQueue'), variant: 'default' },
          { to: '/admin/gallery', label: t('admin.content.galleryQueue') },
          { to: '/admin/live/pending', label: t('admin.livePending') },
          { to: '/admin/comms', label: t('admin.commsInbox') },
        ]}
      />
      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">
        {t('admin.content.pending')}
      </h2>
      <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        {queue.length === 0 ? (
          <li className="px-4 py-6 text-sm text-text-muted">{t('admin.content.emptyQueue')}</li>
        ) : (
          queue.map((item) => (
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
              <Button size="sm" onClick={() => approve(item)}>
                {t('admin.content.approve')}
              </Button>
            </li>
          ))
        )}
      </ul>
    </RoleHomeShell>
  );
}
