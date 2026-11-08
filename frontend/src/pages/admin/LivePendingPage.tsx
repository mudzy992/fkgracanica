import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePendingLiveReports, useApproveMatchReport } from '../../hooks/use-live-admin';
import { formatDateTime } from '../../lib/utils';
import { AdminPageShell, AdminDataTable } from '../../components/admin/AdminPageShell';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Seo } from '../../components/seo/Seo';
import { runAction } from '../../lib/action-errors';

export function LivePendingPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = usePendingLiveReports();
  const approve = useApproveMatchReport();

  return (
    <AdminPageShell
      isError={isError}
      onRetry={() => void refetch()}
      title={t('admin.livePendingPage.title')}
    >
      <Seo title={t('admin.livePending')} />
      <AdminDataTable
        rows={data ?? []}
        empty={isLoading ? t('admin.common.loading') : t('admin.livePendingPage.empty')}
        columns={[
          {
            key: 'match',
            header: t('admin.livePendingPage.match'),
            render: (r) => `${r.homeClub?.name} ${r.homeScore}:${r.awayScore} ${r.awayClub?.name}`,
          },
          {
            key: 'comp',
            header: t('admin.calendar.competition'),
            render: (r) => r.season?.competition?.name ?? '—',
          },
          {
            key: 'date',
            header: t('admin.analyticsPanel.date'),
            render: (r) => formatDateTime(r.scheduledAt),
          },
          {
            key: 'status',
            header: t('admin.membershipForm.status'),
            render: () => <Badge>{t('admin.commentator.awaitingApproval')}</Badge>,
          },
          {
            key: 'actions',
            header: t('admin.common.actions'),
            render: (r) => (
              <div className="flex flex-wrap gap-2">
                <Link to={`/utakmice/${r.id}`}>
                  <Button size="sm" variant="outline">
                    Pregled
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() => void runAction(approve.mutateAsync(r.id))}
                  disabled={approve.isPending}
                >
                  Odobri
                </Button>
              </div>
            ),
          },
        ]}
      />
    </AdminPageShell>
  );
}
