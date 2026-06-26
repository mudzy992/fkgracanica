import { motion, useReducedMotion } from 'framer-motion';
import { mediaUrl } from '../../../lib/media';
import { clubCrestPath } from '../../../lib/club-utils';
import { PublicHeroShell } from '../shell/PublicHeroShell';
import { defaultTransition, fadeUp } from '../../../lib/motion/presets';
import type { Club } from '../../../types';
import { Skeleton } from '../../ui/skeleton';

interface Props {
  club?: Club | null;
  isLoading?: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function ClubProfileHero({ club, isLoading, eyebrow, title, subtitle }: Props) {
  const reduce = useReducedMotion();

  if (isLoading) {
    return (
      <header className="border-b border-[var(--border-subtle)] bg-[image:var(--gradient-page-hero)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 sm:px-6 md:py-20">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
      </header>
    );
  }

  const crest = clubCrestPath(club);
  const meta = [club?.city, club?.stadium].filter(Boolean).join(' · ');

  return (
    <PublicHeroShell>
      <header className="border-b border-[var(--border-subtle)] bg-[image:var(--gradient-page-hero)]">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20">
          {crest && (
            <motion.img
              src={mediaUrl(crest, 'medium')}
              alt={club?.name ?? ''}
              className="mx-auto mb-5 h-20 w-20 object-contain sm:h-24 sm:w-24 md:h-28 md:w-28"
              variants={fadeUp}
              initial={reduce ? false : 'hidden'}
              animate="visible"
              transition={{ ...defaultTransition, delay: 0.05 }}
            />
          )}
          {eyebrow && (
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm"
              variants={fadeUp}
              initial={reduce ? false : 'hidden'}
              animate="visible"
              transition={{ ...defaultTransition, delay: 0.15 }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            className="font-display mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl"
            variants={fadeUp}
            initial={reduce ? false : 'hidden'}
            animate="visible"
            transition={{ ...defaultTransition, delay: 0.25 }}
          >
            {title ?? club?.name ?? 'Klub'}
          </motion.h1>
          {(subtitle ?? club?.description) && (
            <motion.p
              className="mx-auto mt-3 max-w-2xl text-base text-text-muted sm:mt-4 sm:text-lg"
              variants={fadeUp}
              initial={reduce ? false : 'hidden'}
              animate="visible"
              transition={{ ...defaultTransition, delay: 0.35 }}
            >
              {subtitle ?? club?.description}
            </motion.p>
          )}
          {meta && <p className="mt-3 text-sm text-text-muted">{meta}</p>}
        </div>
      </header>
    </PublicHeroShell>
  );
}
