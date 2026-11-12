import { motion, useReducedMotion } from 'framer-motion';
import { mediaUrl } from '../../../lib/media';
import { defaultTransition, fadeUp } from '../../../lib/motion/presets';
import type { ClubTimelineEvent } from '../../../types';
import { ClubStoryChapterBg } from './ClubStoryChapterBg';
import { ExpandableRichContent } from './ExpandableRichContent';

interface Props {
  event: ClubTimelineEvent;
}

export function ClubStoryChapter({ event }: Props) {
  const reduce = useReducedMotion();
  const imageUrl = mediaUrl(event.imagePath, 'original');

  return (
    <section
      id={`story-chapter-${event.id}`}
      data-chapter-id={event.id}
      aria-label={`${event.year} ${event.title}`}
      className="relative min-h-dvh snap-start snap-always overflow-hidden"
    >
      <div className="sticky top-0 min-h-dvh overflow-hidden">
        <ClubStoryChapterBg imageUrl={imageUrl} />
        <p
          aria-hidden
          className="font-display pointer-events-none absolute left-1 top-24 z-[1] select-none text-[clamp(4.5rem,16vw,10rem)] font-bold leading-none text-white/25 drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] sm:top-20"
        >
          {event.year}
        </p>
        <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-4 pb-28 pt-24 sm:px-6 lg:pb-24 lg:pr-28">
          <motion.div
            initial={reduce ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.55 }}
            variants={fadeUp}
            transition={defaultTransition}
            className="max-w-xl rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-6 backdrop-blur-sm sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light">{event.year}</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {event.title}
            </h2>
            {event.description && (
              <ExpandableRichContent
                html={event.description}
                className="mt-4 text-base text-white/80 sm:text-lg"
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
