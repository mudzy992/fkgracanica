import { useMatch, useMatches } from '../../../hooks';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { useMatchRealtime } from '../../../hooks/use-match-realtime';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import type { HomeAction } from './HomeQuickActions';
import { HomeKpiGrid } from './HomeKpiGrid';
import { HomeQuickActions } from './HomeQuickActions';
import { RoleHomeShell } from './RoleHomeShell';
import { CommentatorDeskList } from './CommentatorDeskList';
import { CommentatorLiveHero } from './CommentatorLiveHero';
import {
  deskCounts,
  deskHref,
  pickAwaitingApproval,
  pickLive,
  pickNeedsReport,
  pickToday,
  primaryDeskMatch,
} from './commentator-desk';

const COMMENTATOR_KPI_PERMISSIONS: Record<string, string> = {
  live: 'live.manage',
  today: 'matches.manage',
  drafts: 'live.manage',
  pending: 'live.manage',
};

function KpiSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-[118px] border-[var(--border-subtle)] bg-surface/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-3 w-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HeroSkeleton() {
  return (
    <Card
      className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-5"
      aria-busy="true"
    >
      <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-20 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="mt-5 flex justify-center gap-2">
        <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
      </div>
    </Card>
  );
}

export function CommentatorHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const perms = user?.permissions;
  const enabledMatches =
    hasPermission(perms, 'live.manage') || hasPermission(perms, 'matches.manage');

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useMatches(
    undefined,
    undefined,
    { enabled: enabledMatches },
  );
  const matches = data ?? [];
  const counts = deskCounts(matches);
  const live = pickLive(matches);
  const liveId = live[0]?.id;
  const liveDetailQuery = useMatch(liveId ?? '', { enabled: !!liveId && enabledMatches });
  const liveDetail = liveDetailQuery.data;
  useMatchRealtime(liveId, { enabled: enabledMatches });
  const hero = liveDetail ?? live[0];
  const primary = primaryDeskMatch(matches);
  const draft = pickNeedsReport(matches)[0];
  const today = pickToday(matches)[0];
  const pending = pickAwaitingApproval(matches)[0];

  const isKpiLoading = isLoading;
  const isKpiError = isError;
  const isKpiFetching = isFetching;
  const kpiUpdatedAt = dataUpdatedAt;

  const lastUpdated = kpiUpdatedAt
    ? new Date(kpiUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const handleRetryKpi = () => {
    void refetch();
    void liveDetailQuery.refetch();
  };

  const kpiItems = [
    {
      key: 'live',
      label: t('admin.commentator.live'),
      value: counts.live,
      hint: t('admin.commentator.liveHint'),
      href:
        hasPermission(perms, COMMENTATOR_KPI_PERMISSIONS.live) && live[0]
          ? deskHref(live[0])
          : undefined,
    },
    {
      key: 'today',
      label: t('admin.commentator.today'),
      value: counts.today,
      hint: t('admin.commentator.todayHint'),
      href:
        hasPermission(perms, COMMENTATOR_KPI_PERMISSIONS.today) && today
          ? deskHref(today)
          : undefined,
    },
    {
      key: 'drafts',
      label: t('admin.commentator.draftReports'),
      value: counts.drafts,
      hint: t('admin.commentator.draftReportsHint'),
      href:
        hasPermission(perms, COMMENTATOR_KPI_PERMISSIONS.drafts) && draft
          ? deskHref(draft)
          : undefined,
    },
    {
      key: 'pending',
      label: t('admin.commentator.awaitingApproval'),
      value: counts.pending,
      hint: t('admin.commentator.awaitingApprovalHint'),
      href:
        hasPermission(perms, COMMENTATOR_KPI_PERMISSIONS.pending) && pending
          ? deskHref(pending)
          : undefined,
    },
  ];

  const rawActions: HomeAction[] = [];
  if (primary) {
    rawActions.push({
      to: deskHref(primary),
      label: t('admin.commentator.openDesk'),
      variant: 'default',
    });
  }
  if (live[0]) {
    rawActions.push({ to: `/live/${live[0].id}`, label: t('admin.commentator.publicLive') });
  }
  if (draft) {
    rawActions.push({ to: deskHref(draft), label: t('admin.commentator.report') });
  }

  // Permission gating for quick actions: openDesk & publicLive -> live.manage, report -> matches.manage
  const reportLabel = t('admin.commentator.report');
  const actions = rawActions.filter((a) => {
    if (a.label === reportLabel) {
      return hasPermission(perms, 'matches.manage');
    }
    return hasPermission(perms, 'live.manage');
  });

  // Keep hook deps stable: t() inside filter would create new function each render but ok
  // Use label string compare via translation key is stable because t returns key when mocked

  return (
    <RoleHomeShell
      seo="Komentator"
      title={t('admin.home.commentatorTitle')}
      hint={t('admin.home.commentatorHint')}
    >
      {isKpiError ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-text-muted">{t('admin.home.matchesError')}</p>
          <Button variant="outline" onClick={handleRetryKpi} disabled={isKpiFetching}>
            {isKpiFetching ? t('admin.common.loading') : t('actions.retry')}
          </Button>
        </div>
      ) : isKpiLoading ? (
        <KpiSkeletonGrid count={4} />
      ) : (
        <HomeKpiGrid items={kpiItems} />
      )}

      {lastUpdated ? (
        <div className="mt-6 flex items-center gap-3 text-xs text-text-muted">
          <span>
            {t('admin.home.lastUpdated', {
              defaultValue: 'Ažurirano u {{time}}',
              time: lastUpdated,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch();
              void liveDetailQuery.refetch();
            }}
            disabled={isKpiFetching || liveDetailQuery.isFetching}
          >
            {isKpiFetching || liveDetailQuery.isFetching
              ? t('admin.common.loading')
              : t('admin.home.refresh', { defaultValue: 'Osvježi' })}
          </Button>
        </div>
      ) : null}

      {actions.length > 0 ? <HomeQuickActions items={actions} /> : null}

      {liveId && liveDetailQuery.isLoading ? (
        <div className="mt-8">
          <HeroSkeleton />
        </div>
      ) : hero ? (
        <div className="mt-8">
          <CommentatorLiveHero match={hero} />
        </div>
      ) : null}

      <div className="mt-8">
        <CommentatorDeskList matches={matches} isLoading={isLoading} />
      </div>
    </RoleHomeShell>
  );
}
