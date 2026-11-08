import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCmsPages, useDeleteCmsPage } from '../../../hooks/use-cms-pages';
import { useConfirm } from '../../../hooks/use-confirm';
import { asArray } from '../../../lib/as-array';
import { Seo } from '../../../components/seo/Seo';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../../components/admin/AdminPageShell';
import { contentStatusLabel } from '../../../lib/content-status-labels';
import type { CmsPage } from '../../../cms/types';
import { runAction } from '../../../lib/action-errors';

interface Props {
  onCreate: () => void;
}

function canDeletePage(page: CmsPage) {
  return !page.isSystem && page.status === 'DRAFT';
}

export function CmsPagesList({ onCreate }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCmsPages(true);
  const pages = asArray<CmsPage>(data);
  const remove = useDeleteCmsPage();
  const { confirm, dialog } = useConfirm();

  const onDelete = async (page: CmsPage) => {
    if (!canDeletePage(page)) return;
    const ok = await confirm({
      title: 'Obrisati stranicu?',
      description: `${page.title} (${page.slug}) — samo nacrti se mogu obrisati.`,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void runAction(remove.mutateAsync(page.id));
  };

  return (
    <>
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('admin.cmsPages.title')}
        isLoading={isLoading}
        actions={<Button onClick={onCreate}>{t('admin.cmsPages.new')}</Button>}
      >
        <AdminDataTable
          rows={pages}
          empty={t('admin.cmsPages.empty')}
          columns={[
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            { key: 'slug', header: 'Slug', render: (r) => r.slug },
            {
              key: 'status',
              header: 'Status',
              render: (r) => (
                <Badge variant={r.status === 'PUBLISHED' ? 'success' : 'muted'}>
                  {contentStatusLabel(r.status)}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <div className="flex flex-wrap gap-2">
                  <Link to={`/admin/cms/pages/${r.id}`}>
                    <Button size="sm" variant="outline">
                      Uredi layout
                    </Button>
                  </Link>
                  {canDeletePage(r) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-danger"
                      onClick={() => void onDelete(r)}
                    >
                      Obriši
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <Seo title={t('admin.cmsPages.title')} />
      {dialog}
    </>
  );
}
