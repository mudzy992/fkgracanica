import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { mediaUrl } from '../../../lib/media';
import { clubCrestPath } from '../../../lib/club-utils';
import { defaultTransition, fadeUp, scaleIn } from '../../../lib/motion/presets';
import type { Club } from '../../../types';

interface Props {
  club?: Club | null;
  firstYear?: number;
}

export function ClubStoryColdOpen({ club, firstYear }: Props) {
  const reduce = useReducedMotion();
  const crest = clubCrestPath(club);
  const headline = firstYear ? `Od ${firstYear}. srce Gračanice.` : 'Naša priča.';

  const scrollToFilm = () => {
    document.getElementById('story-film')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <header className="story-grain relative -mt-16 flex min-h-dvh items-center overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-28 text-center sm:px-6">
        {crest && (
          <motion.div
            className="relative mb-8"
            variants={scaleIn}
            initial={reduce ? false : 'hidden'}
            animate="visible"
            transition={defaultTransition}
          >
            <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-2xl" />
            <img
              src={mediaUrl(crest, 'medium')}
              alt=""
              className="relative h-24 w-24 object-contain drop-shadow-[0_0_30px_rgba(96,165,250,0.35)] sm:h-28 sm:w-28 md:h-32 md:w-32"
            />
          </motion.div>
        )}
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light sm:text-sm"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          animate="visible"
          transition={{ ...defaultTransition, delay: 0.12 }}
        >
          {club?.name ?? 'FK Gračanica'}
        </motion.p>
        <motion.h1
          className="font-display mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          animate="visible"
          transition={{ ...defaultTransition, delay: 0.22 }}
        >
          {headline}
        </motion.h1>
        <button
          type="button"
          onClick={scrollToFilm}
          aria-label="Nastavi priču"
          className="mt-16 text-white/50 transition hover:text-white"
        >
          <ChevronDown size={32} className={reduce ? '' : 'animate-bounce'} />
        </button>
      </div>
    </header>
  );
}
