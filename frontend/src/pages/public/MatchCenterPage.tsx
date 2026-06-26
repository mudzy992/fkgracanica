import { Link, useParams } from 'react-router-dom';
import { useMatch, useNewsForMatch, useTeamStats } from '../../hooks';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { formatDateTime } from '../../lib/utils';
import { matchEventLabel } from '../../lib/match-event-labels';
import { Seo } from '../../components/seo/Seo';
import { ClubCrest } from '../../components/public/clubs/ClubCrest';
import { ClubLink } from '../../components/public/clubs/ClubLink';
import { PlayerLink } from '../../components/public/players/PlayerLink';
import { VideoEmbed } from '../../components/public/VideoEmbed';
import { MatchReportApproval } from '../../components/match/MatchReportApproval';
import {
  MatchLineupSection,
  MatchRelatedNewsSection,
  MatchTeamStatsSection,
} from '../../components/match/MatchCenterSections';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function MatchCenterPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, isError } = useMatch(id ?? '');
  const { data: teamStats, isLoading: tsl } = useTeamStats(id);
  const { data: relatedNews, isLoading: rnl } = useNewsForMatch(id);
  const canApprove = hasPermission(user?.permissions, 'live.approve');

  if (isLoading) return <Skeleton className="mx-auto mt-12 h-96 max-w-3xl" />;
  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Utakmica nije pronađena.</p>;
  }

  const isLive = data.status === 'LIVE' || data.status === 'HALFTIME';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
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
      <Card>
        <CardContent className="p-4 sm:p-8 text-center">
          <p className="text-sm text-text-muted">{formatDateTime(data.scheduledAt)}</p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <div className="flex w-full flex-col items-center gap-2 sm:flex-1 sm:items-end">
              <ClubCrest club={data.homeClub} size="md" />
              {data.homeClub?.slug ? (
                <ClubLink slug={data.homeClub.slug} name={data.homeClub.name} className="text-center text-lg sm:text-right" />
              ) : (
                <p className="text-center text-lg font-bold sm:text-right">{data.homeClub?.name}</p>
              )}
            </div>
            <p className="text-4xl font-bold text-primary sm:shrink-0">
              {data.homeScore} : {data.awayScore}
            </p>
            <div className="flex w-full flex-col items-center gap-2 sm:flex-1 sm:items-start">
              <ClubCrest club={data.awayClub} size="md" />
              {data.awayClub?.slug ? (
                <ClubLink slug={data.awayClub.slug} name={data.awayClub.name} className="text-lg" />
              ) : (
                <p className="text-lg font-bold">{data.awayClub?.name}</p>
              )}
            </div>
          </div>
          {data.venue && <p className="mt-4 text-sm text-text-muted">{data.venue}</p>}
        </CardContent>
      </Card>

      {data.youtubeUrl && (
        <div className="mt-8">
          <VideoEmbed url={data.youtubeUrl} title="Snimak utakmice" />
        </div>
      )}

      <MatchLineupSection match={data} />
      <MatchTeamStatsSection match={data} stats={teamStats} loading={tsl} />

      {data.events && data.events.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Događaji</h2>
          <div className="space-y-2">
            {data.events.map((ev) => (
              <div key={ev.id} className="flex gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                <span className="font-bold text-primary">{ev.minute}&apos;</span>
                <span>
                  {matchEventLabel(ev.type)}
                  {ev.player && (
                    <>
                      {' — '}
                      <PlayerLink
                        id={ev.player.id}
                        name={`${ev.player.firstName} ${ev.player.lastName}`}
                      />
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <MatchRelatedNewsSection items={relatedNews} loading={rnl} />
    </div>
  );
}
