import { mediaUrl } from '../../../lib/media';
import { RichContent } from '../RichContent';
import type { ClubTimelineEvent } from '../../../types';
import { cn } from '../../../lib/utils';

interface Props {
  event: ClubTimelineEvent;
  featured?: boolean;
}

export function TimelineEventCard({ event, featured }: Props) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border p-6 shadow-sm transition-shadow',
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
