import { useMemo, useRef } from 'react';
import type { ClubTimelineEvent } from '../../../types';
import { ClubStoryChapter } from './ClubStoryChapter';
import { ClubStoryProgress } from './ClubStoryProgress';
import { useActiveChapter } from './use-active-chapter';

interface Props {
  events: ClubTimelineEvent[];
}

export function ClubStoryFilm({ events }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ids = useMemo(() => events.map((event) => event.id), [events]);
  const { activeId, setActiveId } = useActiveChapter(rootRef, ids);

  return (
    <div id="story-film" ref={rootRef}>
      <ClubStoryProgress events={events} activeId={activeId} onSelect={setActiveId} />
      {events.map((event) => (
        <ClubStoryChapter key={event.id} event={event} />
      ))}
    </div>
  );
}
