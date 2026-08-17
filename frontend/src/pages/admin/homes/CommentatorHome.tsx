import { Link } from 'react-router-dom';
import { useMatches } from '../../../hooks';
import { Button } from '../../../components/ui/button';
import { matchStatusLabel } from '../../../lib/match-status-label';
import { formatDateTime } from '../../../lib/utils';
import { matchTitle, pickCommentatorDeskMatches } from './commentator-desk';
import { HomeKpiGrid } from './HomeKpiGrid';
import { RoleHomeShell } from './RoleHomeShell';

export function CommentatorHome() {
  const { data, isLoading } = useMatches();
  const matches = data ?? [];
  const desk = pickCommentatorDeskMatches(matches);
  const live = matches.filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME').length;
  const upcoming = matches.filter((m) => m.status === 'SCHEDULED').length;
  const reports = matches.filter(
    (m) => m.status === 'FINISHED' && m.reportStatus === 'PENDING_APPROVAL',
  ).length;

  return (
    <RoleHomeShell
      seo="Komentator"
      title="Komentator — kontrolna tabla"
      hint="Odaberite utakmicu, vodite semafor, predajte izvještaj."
    >
      <HomeKpiGrid
        items={[
          { key: 'live', label: 'Uživo', value: isLoading ? '…' : live, hint: 'Live / poluvrijeme' },
          { key: 'upcoming', label: 'Zakazane', value: isLoading ? '…' : upcoming, hint: 'Predstojeće' },
          {
            key: 'reports',
            label: 'Izvještaji',
            value: isLoading ? '…' : reports,
            hint: 'Čeka predaju / odobrenje',
          },
        ]}
      />
      <ul className="mt-6 divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
        {isLoading ? (
          <li className="px-4 py-6 text-sm text-text-muted">Učitavanje utakmica…</li>
        ) : desk.length === 0 ? (
          <li className="px-4 py-6 text-sm text-text-muted">Nema utakmica za desk.</li>
        ) : (
          desk.map((match) => (
            <li key={match.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{matchTitle(match)}</p>
                <p className="text-xs text-text-muted">
                  {matchStatusLabel(match.status)} · {formatDateTime(match.scheduledAt)}
                </p>
              </div>
              <Link to={`/admin/live/${match.id}`}>
                <Button size="sm">Otvori desk</Button>
              </Link>
            </li>
          ))
        )}
      </ul>
    </RoleHomeShell>
  );
}
