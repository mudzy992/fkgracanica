import { Link, useParams } from 'react-router-dom';
import { useMatch, useMatchStatistics, useNewsForMatch } from '../../hooks';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { formatDateTime } from '../../lib/utils';
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
  const canApprove = hasPermission(user?.permissions, 'live.approve');

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Utakmica nije pronađena.</p>;
  }

  const isLive = data.status === 'LIVE' || data.status === 'HALFTIME';

  return (
    <div className="pb-16">
      <PageContainer size="md" className="py-10 sm:py-12">
        <Seo title={`${data.homeClub?.name} vs ${data.awayClub?.name}`} />
        {canApprove && <MatchReportApproval matchId={data.id} reportStatus={data.reportStatus} />}
        <div className="mb-4 flex items-center justify-between">
          <Badge variant={isLive ? 'danger' : 'muted'}>{data.status}</Badge>
          {isLive && (
            <Link to={`/live/${data.id}`}>
              <Button size="sm">Live centar</Button>
            </Link>
          )}
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
