import { useMatch, useMatches } from '../../../hooks';
import { useTranslation } from 'react-i18next';
import { useMatchRealtime } from '../../../hooks/use-match-realtime';
import { Button } from '../../../components/ui/button';
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

export function CommentatorHome() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useMatches();
  const matches = data ?? [];
  const counts = deskCounts(matches);
  const live = pickLive(matches);
  const liveId = live[0]?.id;
  const { data: liveDetail } = useMatch(liveId ?? '');
  useMatchRealtime(liveId);
  const hero = liveDetail ?? live[0];
  const primary = primaryDeskMatch(matches);
  const draft = pickNeedsReport(matches)[0];
  const today = pickToday(matches)[0];
  const pending = pickAwaitingApproval(matches)[0];
  const actions: HomeAction[] = [];
  if (primary)
    actions.push({
      to: deskHref(primary),
      label: t('admin.commentator.openDesk'),
      variant: 'default',
    });
  if (live[0])
    actions.push({ to: `/live/${live[0].id}`, label: t('admin.commentator.publicLive') });
  if (draft) actions.push({ to: deskHref(draft), label: t('admin.commentator.report') });

  if (isError) {
    return (
      <RoleHomeShell
        seo="Komentator"
        title={t('admin.home.commentatorTitle')}
        hint={t('admin.home.commentatorHintShort')}
      >
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-text-muted">{t('admin.home.matchesError')}</p>
          <Button variant="outline" onClick={() => void refetch()}>
            {t('actions.retry')}
          </Button>
        </div>
      </RoleHomeShell>
    );
  }

  return (
    <RoleHomeShell
      seo="Komentator"
      title={t('admin.home.commentatorTitle')}
      hint={t('admin.home.commentatorHint')}
    >
      <HomeKpiGrid
        items={[
          {
            key: 'live',
            label: t('admin.commentator.live'),
            value: isLoading ? '…' : counts.live,
            hint: t('admin.commentator.liveHint'),
            href: live[0] ? deskHref(live[0]) : undefined,
          },
          {
            key: 'today',
            label: t('admin.commentator.today'),
            value: isLoading ? '…' : counts.today,
            hint: t('admin.commentator.todayHint'),
            href: today ? deskHref(today) : undefined,
          },
          {
            key: 'drafts',
            label: t('admin.commentator.draftReports'),
            value: isLoading ? '…' : counts.drafts,
            hint: t('admin.commentator.draftReportsHint'),
            href: draft ? deskHref(draft) : undefined,
          },
          {
            key: 'pending',
            label: t('admin.commentator.awaitingApproval'),
            value: isLoading ? '…' : counts.pending,
            hint: t('admin.commentator.awaitingApprovalHint'),
            href: pending ? deskHref(pending) : undefined,
          },
        ]}
      />
      {actions.length > 0 ? <HomeQuickActions items={actions} /> : null}
      {hero ? (
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
