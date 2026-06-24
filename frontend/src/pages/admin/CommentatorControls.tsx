import { useState } from 'react';
import { useAddMatchEvent, useEndMatch, useStartMatch } from '../../hooks/use-live-admin';
import type { Match } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

const EVENT_LABELS: Record<string, string> = {
  GOAL: 'Gol',
  YELLOW_CARD: 'Žuti karton',
  RED_CARD: 'Crveni karton',
  SUBSTITUTION: 'Izmjena',
};

interface Props {
  match: Match;
}

export function CommentatorControls({ match }: Props) {
  const [minute, setMinute] = useState(match.minute || 1);
  const start = useStartMatch();
  const end = useEndMatch();
  const addEvent = useAddMatchEvent();

  const isLive = match.status === 'LIVE';
  const busy = start.isPending || end.isPending || addEvent.isPending;

  const addGoal = (teamSide: 'home' | 'away') => {
    void addEvent.mutateAsync({
      matchId: match.id,
      type: 'GOAL',
      minute,
      teamSide,
      description: teamSide === 'home' ? 'Gol domaćina' : 'Gol gosta',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={isLive ? 'danger' : 'muted'}>{match.status}</Badge>
        <label className="flex items-center gap-2 text-sm">
          Minuta
          <Input
            type="number"
            min={0}
            max={120}
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
            className="w-20"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {match.status === 'SCHEDULED' && (
          <Button onClick={() => void start.mutateAsync(match.id)} disabled={busy}>
            Započni utakmicu
          </Button>
        )}
        {isLive && (
          <>
            <Button onClick={() => addGoal('home')} disabled={busy}>
              Gol domaćin
            </Button>
            <Button onClick={() => addGoal('away')} disabled={busy} variant="outline">
              Gol gost
            </Button>
            <Button onClick={() => void end.mutateAsync(match.id)} disabled={busy} variant="ghost">
              Završi utakmicu
            </Button>
          </>
        )}
      </div>

      <ul className="space-y-2 text-sm">
        {match.events?.map((ev) => (
          <li key={ev.id} className="rounded border border-slate-200 p-2">
            <span className="font-semibold text-primary">{ev.minute}&apos;</span>{' '}
            {EVENT_LABELS[ev.type] ?? ev.type}
            {ev.description ? ` — ${ev.description}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
