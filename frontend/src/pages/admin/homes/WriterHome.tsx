import { Link } from 'react-router-dom';
import { useGalleryAdminList } from '../../../hooks/use-content-admin';
import { useNewsList } from '../../../hooks';
import { contentStatusLabel } from '../../../lib/content-status-labels';
import { HomeKpiGrid } from './HomeKpiGrid';
import { HomeQuickActions } from './HomeQuickActions';
import { RoleHomeShell } from './RoleHomeShell';

export function WriterHome() {
  const drafts = useNewsList('DRAFT');
  const pending = useNewsList('PENDING');
  const published = useNewsList('PUBLISHED');
  const albums = useGalleryAdminList();
  const queue = [...(drafts.data ?? []), ...(pending.data ?? [])].slice(0, 8);
  const loading = drafts.isLoading || pending.isLoading || published.isLoading || albums.isLoading;

  return (
    <RoleHomeShell
      seo="Writer"
      title="Writer — kontrolna tabla"
      hint="Samo sadržaj: vijesti i galerija. Objavu radi moderator."
    >
      <HomeKpiGrid
        items={[
          { key: 'drafts', label: 'Nacrti', value: loading ? '…' : (drafts.data?.length ?? 0), href: '/admin/news', hint: 'Vijesti u izradi' },
          { key: 'pending', label: 'Na odobrenju', value: loading ? '…' : (pending.data?.length ?? 0), href: '/admin/news', hint: 'Čeka moderatora' },
          { key: 'published', label: 'Objavljene', value: loading ? '…' : (published.data?.length ?? 0), href: '/admin/news', hint: 'Na portalu' },
          { key: 'albums', label: 'Albumi', value: loading ? '…' : (albums.data?.length ?? 0), href: '/admin/gallery', hint: 'Galerija' },
        ]}
      />
      <HomeQuickActions
        items={[
          { to: '/admin/news/new', label: 'Nova vijest', variant: 'default' },
          { to: '/admin/media', label: 'Mediji / mape' },
          { to: '/admin/gallery/new', label: 'Novi album' },
          { to: '/admin/gallery', label: 'Galerija' },
        ]}
      />
      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">Neobjavljene vijesti</h2>
      <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        {queue.length === 0 ? (
          <li className="px-4 py-6 text-sm text-text-muted">Nema nacrta ni predaja.</li>
        ) : (
          queue.map((item) => (
            <li key={item.id}>
              <Link
                to={`/admin/news/${item.id}/edit`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-surface/80"
              >
                <span className="truncate font-medium">{item.title}</span>
                <span className="shrink-0 text-xs text-text-muted">{contentStatusLabel(item.status)}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </RoleHomeShell>
  );
}
