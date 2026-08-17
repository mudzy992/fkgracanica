import type { ClubTimelineEvent } from '../../../types';

export function sortStoryChapters(events: ClubTimelineEvent[]): ClubTimelineEvent[] {
  return [...events].sort(
    (a, b) => a.year - b.year || (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}
