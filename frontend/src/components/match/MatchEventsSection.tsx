import { PlayerLink } from '../public/players/PlayerLink';
import { NewsSectionTitle } from '../news/NewsSectionTitle';
import { Reveal } from '../../lib/motion/Reveal';
import { matchEventLabel } from '../../lib/match-event-labels';
import type { MatchEvent } from '../../types';

interface Props {
  events: MatchEvent[];
}

export function MatchEventsSection({ events }: Props) {
  if (!events.length) return null;

  return (
    <section className="mt-10 sm:mt-12">
      <Reveal>
        <NewsSectionTitle>Događaji</NewsSectionTitle>
      </Reveal>
      <ul className="mt-2 space-y-2">
        {events.map((ev, i) => (
          <Reveal key={ev.id} delay={Math.min(i * 0.03, 0.3)}>
            <li className="border-gradient-club glass-premium flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
              <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-primary">
                {ev.minute}&apos;
              </span>
              <div className="min-w-0">
                <p className="font-medium text-text">{matchEventLabel(ev.type)}</p>
                {ev.player && (
                  <p className="mt-0.5 text-text-muted">
                    <PlayerLink
                      id={ev.player.id}
                      name={`${ev.player.firstName} ${ev.player.lastName}`}
                    />
                  </p>
                )}
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
