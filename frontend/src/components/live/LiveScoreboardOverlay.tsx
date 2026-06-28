import { useState } from 'react';
import type { LiveClockState } from '../../lib/live-clock';
import type { Match } from '../../types';
import { LiveScoreboardCompact } from './LiveScoreboardCompact';
import { LiveScoreboardExpanded } from './LiveScoreboardExpanded';

interface Props {
  match: Match;
  clock: LiveClockState | null;
}

export function LiveScoreboardOverlay({ match, clock }: Props) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((v) => !v);

  return (
    <div className="absolute left-0 top-0 z-20 p-2 sm:p-3 landscape:p-2">
      {expanded ? (
        <LiveScoreboardExpanded match={match} clock={clock} onToggle={toggle} />
      ) : (
        <LiveScoreboardCompact match={match} clock={clock} onToggle={toggle} />
      )}
    </div>
  );
}
