import { buttonVariants } from "../../components/ui/button-variants";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePendingLiveReports, useApproveMatchReport } from '../../hooks/use-live-admin';
import { cn, formatDateTime } from '../../lib/utils';
import { AdminPageShell, AdminDataTable } from '../../components/admin/AdminPageShell';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Seo } from '../../components/seo/Seo';
import { runAction } from '../../lib/action-errors';

export function LivePendingPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = usePendingLiveReports();
  const approve = useApproveMatchReport();

  return (
    <>
      <Seo title={t('admin.livePending') as string} />
      <AdminPageShell
        title={t('admin.livePendingPage.title') as string}
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        dataUpdatedAt={dataUpdatedAt}
        onRefresh={() => void refetch()}
        onRetry={() => void refetch()}
      >
        <AdminDataTable
        rows={data ?? []}
        empty={t('admin.livePendingPage.empty', { defaultValue: 'Nema utakmica na čekanju.' }) as string}
        columns={[
          {
            key: 'match',
            header: t('admin.livePendingPage.match') as string,
            render: (r) => `${r.homeClub?.name} ${r.homeScore}:${r.awayScore} ${r.awayClub?.name}`,
          },
          {
            key: 'comp',
            header: t('admin.calendar.competition') as string,
            render: (r) => r.season?.competition?.name ?? '—',
          },
          {
            key: 'date',
            header: t('admin.analyticsPanel.date') as string,
            render: (r) => formatDateTime(r.scheduledAt),
          },
          {
            key: 'status',
            header: t('admin.membershipForm.status') as string,
            render: () => <Badge>{t('admin.commentator.awaitingApproval')}</Badge>,
          },
          {
            key: 'actions',
            header: t('admin.common.actions') as string,
            render: (r) => (
              <div className="flex flex-wrap gap-2">
                <Link to={`/utakmice/${r.id}`} className={cn(buttonVariants({variant: "outline", size: "sm"}))}>
                  {t('admin.common.view', { defaultValue: 'Pregled' })}
                </Link>
                <Button
                  size="sm"
                  onClick={() => void runAction(approve.mutateAsync(r.id))}
                  disabled={approve.isPending || Boolean(isFetching)}
                >
                  {t('admin.livePendingPage.approve', { defaultValue: 'Odobri' })}
                </Button>
              </div>
            ),
          },
        ]}
      />
      </AdminPageShell>
    </>
  );
}
