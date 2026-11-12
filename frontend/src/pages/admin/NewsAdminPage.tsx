import { buttonVariants } from "../../components/ui/button-variants";
import { cn } from "../../lib/utils";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { asArray } from '../../lib/as-array';
import { useNewsList } from '../../hooks';
import {
  useDeleteNews,
  useNewsCategories,
  useSubmitNewsForReview,
  useUpdateNewsStatus,
  type NewsCategory,
} from '../../hooks/use-news-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { NewsCategoriesDialog } from './NewsCategoriesDialog';
import { contentStatusLabel } from '../../lib/content-status-labels';
import type { ContentStatus, NewsItem } from '../../types';
import { runAction } from '../../lib/action-errors';

function statusVariant(status: ContentStatus): 'default' | 'success' | 'muted' {
  if (status === 'PUBLISHED') return 'success';
  if (status === 'PENDING') return 'default';
  return 'muted';
}

export function NewsAdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canSubmit = hasPermission(perms, 'news.submit');
  const canApprove = hasPermission(perms, 'news.approve');
  const canManage = hasPermission(perms, 'news.manage');
  const [categoryId, setCategoryId] = useState('');
  const { data: categoriesRaw } = useNewsCategories();
  const categories = asArray<NewsCategory>(categoriesRaw);
  const { data, isLoading, isError, refetch } = useNewsList(undefined, categoryId || undefined);
  const updateStatus = useUpdateNewsStatus();
  const submitReview = useSubmitNewsForReview();
  const deleteNews = useDeleteNews();
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const publish = (item: NewsItem) => {
    void runAction(updateStatus.mutateAsync({ id: item.id, status: 'PUBLISHED' }));
  };

  const submit = (item: NewsItem) => {
    void runAction(submitReview.mutateAsync(item.id));
  };

  const archive = (item: NewsItem) => {
    void runAction(updateStatus.mutateAsync({ id: item.id, status: 'ARCHIVED' }));
  };

  return (
    <>
      <Seo title={t('admin.news')} />
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('admin.news')}
        isLoading={isLoading}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select className="w-auto"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">{t('admin.newsAdmin.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {canManage && (
              <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
                {t('admin.newsAdmin.categories')}
              </Button>
            )}
            <Link to="/admin/news/new" className={cn(buttonVariants())}>{t('admin.content.newNews')}</Link>
          </div>
        }
      >
        <AdminDataTable
          rows={asArray<NewsItem>(data)}
          empty="Nema vijesti — kreirajte prvu."
          columns={[
            {
              key: 'title',
              header: 'Naslov',
              render: (r) => (
                <Link to={`/admin/news/${r.id}/edit`} className="font-medium hover:underline">
                  {r.title}
                </Link>
              ),
            },
            {
              key: 'category',
              header: 'Kategorija',
              render: (r) => r.category?.name ?? '—',
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => (
                <Badge variant={statusVariant(r.status)}>{contentStatusLabel(r.status)}</Badge>
              ),
            },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex flex-wrap gap-2">
                  <Link to={`/admin/news/${r.id}/edit`} className={cn(buttonVariants({variant: "outline", size: "sm"}))}>
                    Uredi
                  </Link>
                  {r.status === 'DRAFT' && canSubmit && !canApprove && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => submit(r)}
                      disabled={submitReview.isPending}
                    >
                      Predaj na pregled
                    </Button>
                  )}
                  {r.status === 'PENDING' && canApprove && (
                    <Button size="sm" onClick={() => publish(r)} disabled={updateStatus.isPending}>
                      Odobri i objavi
                    </Button>
                  )}
                  {r.status === 'DRAFT' && canApprove && (
                    <Button size="sm" onClick={() => publish(r)} disabled={updateStatus.isPending}>
                      Objavi
                    </Button>
                  )}
                  {r.status === 'PUBLISHED' && (
                    <Link to={`/vijesti/${r.slug}`} target="_blank" rel="noreferrer" className={cn(buttonVariants({variant: "outline", size: "sm"}))}>
                  Pregled
                </Link>
                  )}
                  {r.status === 'PUBLISHED' && (
                    <Button size="sm" variant="ghost" onClick={() => archive(r)}>
                      Arhiviraj
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(r)}>
                    Obriši
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <NewsCategoriesDialog open={categoriesOpen} onOpenChange={setCategoriesOpen} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t('admin.newsAdmin.deleteTitle')}
        description={
          deleteTarget ? t('admin.newsAdmin.deleteConfirm', { title: deleteTarget.title }) : ''
        }
        confirmLabel={t('actions.delete')}
        variant="danger"
        isPending={deleteNews.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          void runAction(deleteNews.mutateAsync(deleteTarget.id)).then(() => setDeleteTarget(null));
        }}
      />
    </>
  );
}
