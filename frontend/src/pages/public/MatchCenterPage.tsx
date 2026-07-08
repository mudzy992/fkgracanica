import { Link, useParams } from 'react-router-dom';
import { useMatch, useMatchStatistics, useNewsForMatch, usePublicSettings } from '../../hooks';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { formatDateTime } from '../../lib/utils';
import { matchShareDescription, matchShareImage, matchShareTitle } from '../../lib/match-seo';
import { matchEventLabel } from '../../lib/match-event-labels';
import { MatchScoreHero } from '../../components/match/MatchScoreHero';
import { PageContainer } from '../../components/public/PageContainer';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
import { Seo } from '../../components/seo/Seo';
import { PlayerLink } from '../../components/public/players/PlayerLink';
import { VideoEmbed } from '../../components/public/VideoEmbed';
import { MatchReportApproval } from '../../components/match/MatchReportApproval';
import { MatchLineupSection, MatchRelatedNewsSection } from '../../components/match/MatchCenterSections';
import { MatchStatisticsSection } from '../../components/match/MatchStatisticsSection';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function MatchCenterPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, isError } = useMatch(id ?? '');
  const { data: matchStats, isLoading: msl } = useMatchStatistics(id);
  const { data: relatedNews, isLoading: rnl } = useNewsForMatch(id);
  const { data: settings } = usePublicSettings();
  const canApprove = hasPermission(user?.permissions, 'live.approve');
  const canCommentate = hasPermission(user?.permissions, 'live.manage');

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Utakmica nije pronađena.</p>;
  }

  const isLive = data.status === 'LIVE' || data.status === 'HALFTIME';

  return (
    <div className="pb-16">
      <PageContainer size="md" className="py-10 sm:py-12">
        <Seo
          title={matchShareTitle(data)}
          description={matchShareDescription(data)}
          image={matchShareImage(data, settings?.['club.crestUrl'])}
          url={`/utakmice/${data.id}`}
          type="article"
        />
        {canApprove && <MatchReportApproval matchId={data.id} reportStatus={data.reportStatus} />}
        {canCommentate && data.status === 'FINISHED' && (data.reportStatus === 'DRAFT' || data.reportStatus === 'PENDING_APPROVAL' || !data.reportStatus) && (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <span className="text-text-muted">Izvještaj utakmice — </span>
            <Link to={`/admin/matches/${data.id}/report`} className="font-medium text-primary hover:underline">
              {data.reportStatus === 'PENDING_APPROVAL' ? 'Uredi izvještaj' : 'Kreiraj / uredi izvještaj'}
            </Link>
          </div>
        )}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Badge variant={isLive ? 'danger' : 'muted'}>{data.status}</Badge>
          <div className="flex flex-wrap gap-2">
            <Link to={`/live/${data.id}`}>
              <Button size="sm" variant={isLive ? 'default' : 'outline'}>
                {isLive ? 'Live centar' : 'Live prikaz'}
              </Button>
            </Link>
            {canCommentate && (
              <Link to={`/admin/live/${data.id}`}>
                <Button size="sm" variant="outline">Komentator</Button>
              </Link>
            )}
          </div>
        </div>
        <MatchScoreHero
          homeClub={data.homeClub}
          awayClub={data.awayClub}
          homeScore={data.homeScore}
          awayScore={data.awayScore}
          meta={formatDateTime(data.scheduledAt) + (data.venue ? ` · ${data.venue}` : '')}
          live={isLive}
        />
        {data.youtubeUrl && (
          <div className="mt-8">
            <VideoEmbed url={data.youtubeUrl} title="Snimak utakmice" />
          </div>
        )}
        <MatchLineupSection match={data} />
        <MatchStatisticsSection match={data} stats={matchStats} loading={msl} />
        {data.events && data.events.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display mb-4 text-xl font-semibold">Događaji</h2>
            <div className="space-y-2">
              {data.events.map((ev) => (
                <PremiumCard key={ev.id} className="p-3 text-sm" hover={false}>
                  <span className="font-bold text-primary">{ev.minute}&apos;</span>{' '}
                  {matchEventLabel(ev.type)}
                  {ev.player && (
                    <>
                      {' — '}
                      <PlayerLink id={ev.player.id} name={`${ev.player.firstName} ${ev.player.lastName}`} />
                    </>
                  )}
                </PremiumCard>
              ))}
            </div>
          </section>
        )}
        <MatchRelatedNewsSection items={relatedNews} loading={rnl} />
      </PageContainer>
    </div>
  );
}
