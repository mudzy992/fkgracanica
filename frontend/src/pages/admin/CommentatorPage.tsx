import { useParams } from 'react-router-dom';
import { useMatch } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export function CommentatorPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useMatch(id ?? '');

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div>
      <Seo title="Komentator" />
      <h1 className="mb-6 text-2xl font-bold">Komentator panel</h1>
      {data && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold">
                {data.homeClub?.name} {data.homeScore}:{data.awayScore} {data.awayClub?.name}
              </p>
              <Badge variant="danger">{data.status}</Badge>
            </div>
            <p className="text-sm text-text-muted">
              Upravljanje live događajima i komentarima za utakmicu #{data.id}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
