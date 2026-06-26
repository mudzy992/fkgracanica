import { useInView } from '../../../hooks/use-in-view';
import type { ClubTimelineEvent } from '../../../types';
import { cn } from '../../../lib/utils';
import { TimelineEventCard } from './TimelineEventCard';

interface Props {
  events: ClubTimelineEvent[];
}

function MobileSnapCard({ event, featured }: { event: ClubTimelineEvent; featured?: boolean }) {
  const { ref, visible } = useInView(0.4);
  return (
    <article
      ref={ref}
      className={cn(
        'timeline-mobile-snap-item flex min-h-[80dvh] shrink-0 snap-center items-center py-8',
        visible ? 'timeline-mobile-visible' : 'timeline-mobile-hidden',
      )}
    >
      <TimelineEventCard event={event} featured={featured} />
    </article>
  );
}

export function ClubTimelineMobile({ events }: Props) {
  return (
    <div className="timeline-mobile-snap h-[calc(100dvh-5rem)] snap-y snap-mandatory overflow-y-auto px-2 lg:hidden">
      {events.map((event, index) => (
        <MobileSnapCard key={event.id} event={event} featured={index === 0} />
      ))}
    </div>
  );
}
