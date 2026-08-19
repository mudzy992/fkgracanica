import { useMatch, useMatches } from '../../../hooks';
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
  if (primary) actions.push({ to: deskHref(primary), label: 'Otvori desk', variant: 'default' });
  if (live[0]) actions.push({ to: `/live/${live[0].id}`, label: 'Javni live' });
  if (draft) actions.push({ to: deskHref(draft), label: 'Izvještaj' });

  if (isError) {
    return (
      <RoleHomeShell seo="Komentator" title="Komentator — kontrolna tabla" hint="Semafor, događaji, izvještaji.">
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-text-muted">Nije moguće učitati utakmice.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Pokušaj ponovo
          </Button>
        </div>
      </RoleHomeShell>
    );
  }

  return (
    <RoleHomeShell
      seo="Komentator"
      title="Komentator — kontrolna tabla"
      hint="Semafor, događaji i predaja izvještaja. Bez kalendara i takmičenja."
    >
      <HomeKpiGrid
        items={[
          {
            key: 'live',
            label: 'Uživo',
            value: isLoading ? '…' : counts.live,
            hint: 'Live / poluvrijeme',
            href: live[0] ? deskHref(live[0]) : undefined,
          },
          {
            key: 'today',
            label: 'Danas',
            value: isLoading ? '…' : counts.today,
            hint: 'Zakazane danas',
            href: today ? deskHref(today) : undefined,
          },
          {
            key: 'drafts',
            label: 'Nacrti izvještaja',
            value: isLoading ? '…' : counts.drafts,
            hint: 'Još nisu predati',
            href: draft ? deskHref(draft) : undefined,
          },
          {
            key: 'pending',
            label: 'Čeka odobrenje',
            value: isLoading ? '…' : counts.pending,
            hint: 'Kod moderatora',
            href: pending ? deskHref(pending) : undefined,
          },
        ]}
      />
      {actions.length > 0 ? <HomeQuickActions items={actions} /> : null}
      {hero ? <div className="mt-8"><CommentatorLiveHero match={hero} /></div> : null}
      <div className="mt-8">
        <CommentatorDeskList matches={matches} isLoading={isLoading} />
      </div>
    </RoleHomeShell>
  );
}
