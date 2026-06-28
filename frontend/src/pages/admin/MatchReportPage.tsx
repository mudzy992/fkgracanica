import { Link, Navigate, useParams } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { canEditReport } from '../../lib/match-report';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { CommentatorReportControls } from './commentator/CommentatorReportControls';

export function MatchReportPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMatch(id ?? '');
  useMatchRealtime(id);

  if (isLoading) return <Skeleton className="h-64" />;

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
          <Button variant="outline" size="sm">Detalji utakmice</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Seo title="Izvještaj utakmice" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Izvještaj utakmice</h1>
        <Link to={`/utakmice/${data.id}`}>
          <Button variant="outline" size="sm">Javni prikaz</Button>
        </Link>
      </div>
      <Card>
        <CardContent className="p-6">
          <CommentatorReportControls match={data} />
        </CardContent>
      </Card>
    </div>
  );
}
