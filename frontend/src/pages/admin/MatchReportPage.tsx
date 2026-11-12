import { buttonVariants } from "../../components/ui/button-variants";
import { cn } from "../../lib/utils";
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMatch } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { canEditReport } from '../../lib/match-report';
import { Seo } from '../../components/seo/Seo';
import { AdminBreadcrumbs } from '../../components/admin/AdminBreadcrumbs';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { CommentatorReportControls } from './commentator/CommentatorReportControls';
import { CommentatorDeskHeader } from './commentator/CommentatorDeskHeader';

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function MatchReportPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useMatch(id ?? '');
  useMatchRealtime(id);

  if (isLoading) return <ReportSkeleton />;
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-text-muted">{t('admin.home.matchesError')}</p>
        <Button variant="outline" onClick={() => void refetch()}>
          {t('actions.retry')}
        </Button>
      </div>
    );
  }
  if (!data) {
    return <p className="p-8 text-center text-text-muted">{t('admin.matchReport.notFound')}</p>;
  }
  if (data.status !== 'FINISHED') {
    return <Navigate to={`/admin/live/${data.id}`} replace />;
  }
  if (!canEditReport(data) && data.reportStatus === 'APPROVED') {
    return (
      <div className="space-y-4 p-4">
        <p className="text-text-muted">{t('admin.matchReport.approvedLocked')}</p>
        <Link to={`/utakmice/${data.id}`} className={cn(buttonVariants({variant: "outline", size: "sm"}))}>Detalji utakmice</Link>
      </div>
    );
  }

  return (
    <div>
      <Seo title={t('admin.matchReport.title')} />
      <AdminBreadcrumbs
        className="mb-3"
        items={[
          { label: 'Admin', to: '/admin' },
          { label: 'Takmičenja', to: '/admin/competitions' },
          {
            label: `Izvještaj: ${data.homeClub?.name ?? 'Domaćin'} – ${data.awayClub?.name ?? 'Gost'}`,
          },
        ]}
      />
      <CommentatorDeskHeader
        match={data}
        title={t('admin.matchReport.title')}
        publicHref={`/utakmice/${data.id}`}
        publicLabel="Javni prikaz"
      />
      <Card>
        <CardContent className="p-6">
          <CommentatorReportControls match={data} />
        </CardContent>
      </Card>
    </div>
  );
}
