import { mediaUrl } from '../../../lib/media';
import { RichContent } from '../RichContent';
import { useInView } from '../../../hooks/use-in-view';
import type { ClubTimelineEvent } from '../../../types';
import { cn } from '../../../lib/utils';

interface CardProps {
  event: ClubTimelineEvent;
  featured?: boolean;
}

function TimelineEventCard({ event, featured }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 shadow-sm transition-shadow',
        featured
          ? 'border-primary/35 bg-gradient-to-br from-primary/8 via-background to-accent/5 shadow-md ring-1 ring-primary/10'
          : 'border-slate-200/80 bg-background dark:border-slate-700',
      )}
    >
      <p className="text-sm font-bold uppercase tracking-wider text-accent">{event.year}</p>
      <h2 className="mt-1 text-xl font-bold text-text">{event.title}</h2>
      {event.description && (
        <RichContent html={event.description} className="mt-3 text-sm text-text-muted" />
      )}
      {event.imagePath && (
        <img
          src={mediaUrl(event.imagePath, 'medium')}
          alt=""
          className="mt-4 w-full rounded-xl object-cover"
        />
      )}
    </div>
  );
}

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

interface Props {
  events: ClubTimelineEvent[];
}

export function ClubTimelineRail({ events }: Props) {
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-accent/50 via-primary/40 to-transparent md:left-1/2 md:-translate-x-px" />
      <div className="space-y-10">
        {events.map((event, index) => (
          <TimelineRevealItem key={event.id} event={event} index={index} featured={index === 0} />
        ))}
      </div>
    </div>
  );
}
