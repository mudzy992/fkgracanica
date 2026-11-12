import { Button } from '../../../components/ui/button';
import { formatEventPlayers } from '../../../lib/live-event-text';
import { matchEventLabel } from '../../../lib/match-event-labels';
import type { Match } from '../../../types';
import { useTranslation } from 'react-i18next';

interface Props {
  match: Match;
  onDelete?: (eventId: string) => void;
  deletePending?: boolean;
}

export function CommentatorEventLog({ match, onDelete, deletePending }: Props) {
  const { t } = useTranslation();
  const events = [...(match.events ?? [])].reverse();
  return (
    <div>
      <h3 className="text-sm font-semibold">{t('admin.eventLog.title')}</h3>
      <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-[var(--border-subtle)] p-2 text-sm">
        {events.length === 0 ? (
          <li className="px-1 py-2 text-text-muted">{t('admin.eventLog.empty')}</li>
        ) : (
          events.map((ev) => (
            <li key={ev.id} className="flex items-start justify-between gap-2">
              <span>
                <span className="font-semibold text-primary">{ev.minute}&apos;</span>{' '}
                {matchEventLabel(ev.type)}
                {formatEventPlayers(ev) ? ` — ${formatEventPlayers(ev)}` : ''}
                {ev.description ? ` — ${ev.description}` : ''}
              </span>
              {onDelete ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 shrink-0 text-xs text-danger"
                  disabled={deletePending}
                  onClick={() => onDelete(ev.id)}
                >
                  Obriši
                </Button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
