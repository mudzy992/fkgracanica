import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGalleryAdminList } from '../../../hooks/use-content-admin';
import { useNewsList } from '../../../hooks';
import { contentStatusLabel } from '../../../lib/content-status-labels';
import { HomeKpiGrid } from './HomeKpiGrid';
import { HomeQuickActions } from './HomeQuickActions';
import { RoleHomeShell } from './RoleHomeShell';

export function WriterHome() {
  const { t } = useTranslation();
  const drafts = useNewsList('DRAFT');
  const pending = useNewsList('PENDING');
  const published = useNewsList('PUBLISHED');
  const albums = useGalleryAdminList();
  const queue = [...(drafts.data ?? []), ...(pending.data ?? [])].slice(0, 8);
  const loading = drafts.isLoading || pending.isLoading || published.isLoading || albums.isLoading;

  return (
    <RoleHomeShell
      seo="Writer"
      title={t('admin.home.writerTitle')}
      hint={t('admin.home.writerHint')}
    >
      <HomeKpiGrid
        items={[
          {
            key: 'drafts',
            label: t('admin.content.drafts'),
            value: loading ? '…' : (drafts.data?.length ?? 0),
            href: '/admin/news',
            hint: t('admin.content.draftsHint'),
          },
          {
            key: 'pending',
            label: t('admin.content.pending'),
            value: loading ? '…' : (pending.data?.length ?? 0),
            href: '/admin/news',
            hint: t('admin.content.pendingHint'),
          },
          {
            key: 'published',
            label: t('admin.content.published'),
            value: loading ? '…' : (published.data?.length ?? 0),
            href: '/admin/news',
            hint: t('admin.content.publishedHint'),
          },
          {
            key: 'albums',
            label: t('admin.content.albums'),
            value: loading ? '…' : (albums.data?.length ?? 0),
            href: '/admin/gallery',
            hint: t('admin.gallery'),
          },
        ]}
      />
      <HomeQuickActions
        items={[
          { to: '/admin/news/new', label: t('admin.content.newNews'), variant: 'default' },
          { to: '/admin/media', label: t('admin.content.mediaFolders') },
          { to: '/admin/gallery/new', label: t('admin.content.newAlbum') },
          { to: '/admin/gallery', label: t('admin.gallery') },
        ]}
      />
      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-muted">
        {t('admin.content.unpublishedNews')}
      </h2>
      <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
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
    </RoleHomeShell>
  );
}
