import { Link } from 'react-router-dom';
import { useGalleryList, useNewsList } from '../../../hooks';
import { useContactMessages } from '../../../hooks/use-contact-admin';
import { useApproveMatchReport, usePendingLiveReports } from '../../../hooks/use-live-admin';
import { useUpdateGalleryStatus } from '../../../hooks/use-content-admin';
import { useUpdateNewsStatus } from '../../../hooks/use-news-admin';
import { Button } from '../../../components/ui/button';
import { HomeKpiGrid } from './HomeKpiGrid';
import { HomeQuickActions } from './HomeQuickActions';
import { RoleHomeShell } from './RoleHomeShell';
import { matchTitle } from './commentator-desk';

export function ModeratorHome() {
  const news = useNewsList('PENDING');
  const gallery = useGalleryList('PENDING');
  const live = usePendingLiveReports();
  const inbox = useContactMessages({ unreadOnly: true });
  const publishNews = useUpdateNewsStatus();
  const publishGallery = useUpdateGalleryStatus();
  const approveLive = useApproveMatchReport();
  const loading = news.isLoading || gallery.isLoading || live.isLoading;
  const unread = inbox.data?.meta.total ?? 0;
  const queue = [
    ...(news.data ?? []).slice(0, 4).map((n) => ({ id: n.id, kind: 'news' as const, title: n.title })),
    ...(gallery.data ?? []).slice(0, 3).map((g) => ({ id: g.id, kind: 'gallery' as const, title: g.title })),
    ...(live.data ?? []).slice(0, 3).map((m) => ({ id: m.id, kind: 'live' as const, title: matchTitle(m) })),
  ].slice(0, 8);

  const approve = (item: (typeof queue)[number]) => {
    if (item.kind === 'news') void publishNews.mutateAsync({ id: item.id, status: 'PUBLISHED' });
    if (item.kind === 'gallery') void publishGallery.mutateAsync({ id: item.id, status: 'PUBLISHED' });
    if (item.kind === 'live') void approveLive.mutateAsync(item.id);
  };

  return (
    <RoleHomeShell
      seo="Moderator"
      title="Moderator — kontrolna tabla"
      hint="Queue za odobrenje. Settings i korisnike ne dirate."
    >
      <HomeKpiGrid
        items={[
          { key: 'news', label: 'Vijesti', value: loading ? '…' : (news.data?.length ?? 0), href: '/admin/news', hint: 'Na odobrenju' },
          { key: 'gallery', label: 'Galerije', value: loading ? '…' : (gallery.data?.length ?? 0), href: '/admin/gallery', hint: 'Na odobrenju' },
          { key: 'live', label: 'Live izvještaji', value: loading ? '…' : (live.data?.length ?? 0), href: '/admin/live/pending', hint: 'Nakon utakmice' },
          { key: 'inbox', label: 'Inbox', value: inbox.isLoading ? '…' : unread, href: '/admin/comms', hint: 'Nepročitano' },
        ]}
      />
      <HomeQuickActions
        items={[
          { to: '/admin/news', label: 'Red vijesti', variant: 'default' },
          { to: '/admin/gallery', label: 'Red galerija' },
          { to: '/admin/live/pending', label: 'Live odobrenje' },
          { to: '/admin/comms', label: 'Inbox' },
        ]}
      />
      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">Na odobrenju</h2>
      <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        {queue.length === 0 ? (
          <li className="px-4 py-6 text-sm text-text-muted">Nema stavki na čekanju.</li>
        ) : (
          queue.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <Link
                to={item.kind === 'live' ? `/admin/live/${item.id}` : item.kind === 'news' ? `/admin/news/${item.id}/edit` : `/admin/gallery/${item.id}/edit`}
                className="min-w-0 truncate text-sm font-medium hover:underline"
              >
                {item.title}
              </Link>
              <Button size="sm" onClick={() => approve(item)}>Odobri</Button>
            </li>
          ))
        )}
      </ul>
    </RoleHomeShell>
  );
}
