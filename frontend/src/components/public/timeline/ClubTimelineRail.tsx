import { useInView } from '../../../hooks/use-in-view';
import type { ClubTimelineEvent } from '../../../types';
import { cn } from '../../../lib/utils';
import { ClubTimelineMobile } from './ClubTimelineMobile';
import { TimelineEventCard } from './TimelineEventCard';

interface RevealProps {
  event: ClubTimelineEvent;
  index: number;
  featured?: boolean;
}

function TimelineRevealItem({ event, index, featured }: RevealProps) {
  const { ref, visible } = useInView();
  const isLeft = index % 2 === 0;

  return (
    <article
      ref={ref}
      className={cn(
        'timeline-reveal relative md:grid md:grid-cols-2 md:gap-8',
        visible && 'timeline-reveal-visible',
        isLeft ? 'timeline-reveal-left' : 'timeline-reveal-right',
      )}
    >
      <span
        className={cn(
          'absolute left-2.5 top-6 z-10 flex rounded-full border-4 border-background shadow-md md:left-1/2 md:-translate-x-1/2',
          featured ? 'h-5 w-5 bg-accent' : 'h-4 w-4 bg-primary',
        )}
      />
      <div className={cn('pl-12 md:pl-0', isLeft ? 'md:col-start-1 md:pr-10' : 'md:col-start-2 md:pl-10')}>
        <TimelineEventCard event={event} featured={featured} />
      </div>
    </article>
  );
}

function ClubTimelineDesktop({ events }: { events: ClubTimelineEvent[] }) {
  return (
    <div className="relative mx-auto hidden max-w-4xl lg:block">
      <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-px bg-gradient-to-b from-accent/50 via-primary/40 to-transparent" />
      <div className="space-y-10">
        {events.map((event, index) => (
          <TimelineRevealItem key={event.id} event={event} index={index} featured={index === 0} />
        ))}
      </div>
    </div>
  );
}

interface Props {
  events: ClubTimelineEvent[];
}

export function ClubTimelineRail({ events }: Props) {
  return (
    <>
      <ClubTimelineMobile events={events} />
      <ClubTimelineDesktop events={events} />
    </>
  );
}
