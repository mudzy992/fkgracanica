import { Link, useParams } from "react-router-dom";
import {
  useMatch,
  useMatchStatistics,
  useNewsForMatch,
  usePublicSettings,
} from "../../hooks";
import { useAuth } from "../../lib/auth";
import { hasPermission } from "../../lib/permissions";
import { formatDateTime } from "../../lib/utils";
import {
  matchShareDescription,
  matchShareImage,
  matchShareTitle,
} from "../../lib/match-seo";
import { matchStatusLabel } from "../../lib/match-status-label";
import { MatchScoreHero } from "../../components/match/MatchScoreHero";
import { MatchCenterToolbar } from "../../components/match/MatchCenterToolbar";
import { MatchEventsSection } from "../../components/match/MatchEventsSection";
import { PageContainer } from "../../components/public/PageContainer";
import { Seo } from "../../components/seo/Seo";
import { MatchHighlights } from "../../components/match/MatchHighlights";
import { MatchReportApproval } from "../../components/match/MatchReportApproval";
import {
  MatchLineupSection,
  MatchRelatedNewsSection,
} from "../../components/match/MatchCenterSections";
import { MatchStatisticsSection } from "../../components/match/MatchStatisticsSection";
import { Skeleton } from "../../components/ui/skeleton";

export function MatchCenterPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, isError } = useMatch(id ?? "");
  const { data: matchStats, isLoading: msl } = useMatchStatistics(id);
  const { data: relatedNews, isLoading: rnl } = useNewsForMatch(id);
  const { data: settings } = usePublicSettings();
  const canApprove = hasPermission(user?.permissions, "live.approve");
  const canCommentate = hasPermission(user?.permissions, "live.manage");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-56 rounded-3xl sm:h-64" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 p-12 text-center">
        <p className="text-text-muted">Utakmica nije pronađena.</p>
        <Link to="/liga" className="text-sm text-primary hover:underline">
          Natrag na ligu
        </Link>
      </div>
    );
  }

  const isLive = data.status === "LIVE" || data.status === "HALFTIME";
  const meta =
    formatDateTime(data.scheduledAt) + (data.venue ? ` · ${data.venue}` : "");

  return (
    <div className="pb-16 sm:pb-20">
      <PageContainer size="md" className="py-8 sm:py-10 md:py-12">
        <Seo
          title={matchShareTitle(data)}
          description={matchShareDescription(data)}
          image={matchShareImage(data, settings?.["club.crestUrl"])}
          url={`/utakmice/${data.id}`}
          type="article"
        />
        {canApprove && (
          <MatchReportApproval
            matchId={data.id}
            reportStatus={data.reportStatus}
          />
        )}
        {canCommentate &&
          data.status === "FINISHED" &&
          (data.reportStatus === "DRAFT" ||
            data.reportStatus === "PENDING_APPROVAL" ||
            !data.reportStatus) && (
            <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <span className="text-text-muted">Izvještaj utakmice — </span>
              <Link
                to={`/admin/matches/${data.id}/report`}
                className="font-medium text-primary hover:underline"
              >
                {data.reportStatus === "PENDING_APPROVAL"
                  ? "Uredi izvještaj"
                  : "Kreiraj / uredi izvještaj"}
              </Link>
            </div>
          )}

        <MatchCenterToolbar
          matchId={data.id}
          status={data.status}
          isLive={isLive}
          canCommentate={canCommentate}
        />

        <MatchScoreHero
          homeClub={data.homeClub}
          awayClub={data.awayClub}
          homeScore={data.homeScore}
          awayScore={data.awayScore}
          meta={meta}
          live={isLive}
          statusLabel={matchStatusLabel(data.status)}
        />

        <MatchHighlights
          streamUrl={data.youtubeUrl}
          highlights={data.highlights}
        />

        <MatchLineupSection match={data} />
        <MatchStatisticsSection match={data} stats={matchStats} loading={msl} />
        <MatchEventsSection events={data.events ?? []} />
        <MatchRelatedNewsSection items={relatedNews} loading={rnl} />
      </PageContainer>
    </div>
  );
}
