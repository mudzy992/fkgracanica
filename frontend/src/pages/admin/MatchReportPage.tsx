import { Link, Navigate, useParams } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { canEditReport } from '../../lib/match-report';
import { Seo } from '../../components/seo/Seo';
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
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useMatch(id ?? '');
  useMatchRealtime(id);

  if (isLoading) return <ReportSkeleton />;
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-text-muted">Nije moguće učitati utakmicu.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Pokušaj ponovo
        </Button>
      </div>
    );
  }
  if (!data) {
    return <p className="p-8 text-center text-text-muted">Utakmica nije pronađena.</p>;
  }
  if (data.status !== 'FINISHED') {
    return <Navigate to={`/admin/live/${data.id}`} replace />;
  }
  if (!canEditReport(data) && data.reportStatus === 'APPROVED') {
    return (
      <div className="space-y-4 p-4">
        <p className="text-text-muted">Izvještaj je odobren i više se ne može uređivati.</p>
        <Link to={`/utakmice/${data.id}`}>
          <Button variant="outline" size="sm">
            Detalji utakmice
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Seo title="Izvještaj utakmice" />
      <CommentatorDeskHeader
        match={data}
        title="Izvještaj utakmice"
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
