import { Navigate, useParams } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { CommentatorControls } from './commentator/CommentatorControls';
import { CommentatorDeskHeader } from './commentator/CommentatorDeskHeader';

function DeskSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function CommentatorPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useMatch(id ?? '');
  useMatchRealtime(id);

  if (isLoading) return <DeskSkeleton />;
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
  if (data.status === 'FINISHED') {
    return <Navigate to={`/admin/matches/${data.id}/report`} replace />;
  }

  return (
    <div>
      <Seo title="Komentator" />
      <CommentatorDeskHeader
        match={data}
        title="Komentator panel"
        publicHref={`/live/${data.id}`}
        publicLabel="Javni live prikaz"
      />
      <Card>
        <CardContent className="space-y-4 p-6">
          <CommentatorControls match={data} />
        </CardContent>
      </Card>
    </div>
  );
}
