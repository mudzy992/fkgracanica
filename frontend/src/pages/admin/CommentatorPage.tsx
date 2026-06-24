import { useParams, Link } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { useMatchRealtime } from '../../hooks/use-match-realtime';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { CommentatorControls } from './CommentatorControls';

export function CommentatorPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMatch(id ?? '');
  useMatchRealtime(id);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div>
      <Seo title="Komentator" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Komentator panel</h1>
        {data && (
          <Link to={`/live/${data.id}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              Javni live prikaz
            </Button>
          </Link>
        )}
      </div>
      {data && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-lg font-semibold">
              {data.homeClub?.name} {data.homeScore}:{data.awayScore} {data.awayClub?.name}
            </p>
            <CommentatorControls match={data} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
