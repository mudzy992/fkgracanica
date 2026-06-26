import { mediaUrl } from '../../../lib/media';
import { RichContent } from '../RichContent';
import { PremiumCard } from '../shell/PremiumCard';
import type { ClubTimelineEvent } from '../../../types';
import { cn } from '../../../lib/utils';

interface Props {
  event: ClubTimelineEvent;
  featured?: boolean;
}

export function TimelineEventCard({ event, featured }: Props) {
  return (
    <PremiumCard
      className={cn(
        'w-full p-6',
        featured && 'border-primary/35 bg-gradient-to-br from-primary/8 via-background to-accent/5 ring-1 ring-primary/10',
      )}
      hover={false}
    >
      <p className="text-sm font-bold uppercase tracking-wider text-accent">{event.year}</p>
      <h2 className="font-display mt-1 text-xl font-bold text-text">{event.title}</h2>
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
    </PremiumCard>
  );
}
