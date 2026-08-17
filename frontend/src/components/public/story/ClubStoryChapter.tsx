import { motion, useReducedMotion } from 'framer-motion';
import { mediaUrl } from '../../../lib/media';
import { defaultTransition, fadeUp } from '../../../lib/motion/presets';
import type { ClubTimelineEvent } from '../../../types';
import { RichContent } from '../RichContent';
import { ClubStoryChapterBg } from './ClubStoryChapterBg';

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
      className="relative min-h-dvh overflow-hidden"
    >
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
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={defaultTransition}
          className="max-w-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light">{event.year}</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {event.title}
          </h2>
          {event.description && (
            <RichContent html={event.description} className="mt-4 text-base text-white/70 sm:text-lg [&_p]:text-inherit" />
          )}
        </motion.div>
      </div>
    </section>
  );
}
