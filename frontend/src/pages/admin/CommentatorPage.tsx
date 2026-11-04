import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useMatch(id ?? '');
  useMatchRealtime(id);

  if (isLoading) return <DeskSkeleton />;
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
  if (data.status === 'FINISHED') {
    return <Navigate to={`/admin/matches/${data.id}/report`} replace />;
  }

  return (
    <div>
      <Seo title={t('admin.commentatorPage.title')} />
      <CommentatorDeskHeader
        match={data}
        title={t('admin.commentatorPage.panel')}
        publicHref={`/live/${data.id}`}
        publicLabel={t('admin.commentatorPage.publicLive')}
      />
      <Card>
        <CardContent className="space-y-4 p-6">
          <CommentatorControls match={data} />
        </CardContent>
      </Card>
    </div>
  );
}
