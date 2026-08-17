import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import type { ClubTimelineEvent } from '../../../types';

interface Props {
  events: ClubTimelineEvent[];
  activeId: string;
  onSelect: (id: string) => void;
}

function scrollToChapter(id: string, instant: boolean) {
  document.getElementById(`story-chapter-${id}`)?.scrollIntoView({
    behavior: instant ? 'auto' : 'smooth',
  });
}

export function ClubStoryProgress({ events, activeId, onSelect }: Props) {
  const reduce = useReducedMotion();
  const activeYear = events.find((event) => event.id === activeId)?.year;
  const instant = Boolean(reduce);

  const select = (id: string) => {
    onSelect(id);
    scrollToChapter(id, instant);
  };

  return (
    <>
      <nav
        aria-label="Era"
        className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      >
        <AnimatePresence mode="wait">
          {activeYear != null && (
            <motion.p
              key={activeYear}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="font-display text-2xl font-bold text-white"
            >
              {activeYear}
            </motion.p>
          )}
        </AnimatePresence>
        <ul className="pointer-events-auto flex flex-col items-end gap-1.5">
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => select(event.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider transition',
                  event.id === activeId
                    ? 'bg-primary text-white'
                    : 'text-white/45 hover:text-white',
                )}
              >
                {event.year}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <nav
        aria-label="Era"
        className="pointer-events-none fixed inset-x-0 bottom-3 z-30 px-4 lg:hidden"
      >
        <ul className="pointer-events-auto mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1">
          {events.map((event) => (
            <li key={event.id} className="shrink-0">
              <button
                type="button"
                onClick={() => select(event.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wider transition',
                  event.id === activeId
                    ? 'bg-primary text-white'
                    : 'glass-premium text-white/70',
                )}
              >
                {event.year}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
