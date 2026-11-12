import { motion, useReducedMotion } from 'framer-motion';
import type { Club } from '../../types';
import { ClubCrest } from '../public/clubs/ClubCrest';
import { ClubLink } from '../public/clubs/ClubLink';
import { cn } from '../../lib/utils';

interface Props {
  homeClub?: Club | null;
  awayClub?: Club | null;
  homeScore?: number | null;
  awayScore?: number | null;
  meta?: string;
  live?: boolean;
  statusLabel?: string;
  className?: string;
}

function ClubSide({
  club,
  align,
}: {
  club?: Club | null;
  align: 'end' | 'start';
}) {
  const nameClass = cn(
    'max-w-full truncate text-center text-base font-bold text-white sm:text-lg',
    align === 'end' ? 'sm:text-right' : 'sm:text-left',
  );
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center gap-2',
        align === 'end' ? 'sm:items-end' : 'sm:items-start',
      )}
    >
      <ClubCrest club={club} size="lg" />
      {club?.slug ? (
        <ClubLink slug={club.slug} name={club.name} className={cn(nameClass, 'hover:text-primary-light')} />
      ) : (
        <p className={nameClass}>{club?.name}</p>
      )}
    </div>
  );
}

export function MatchScoreHero({
  homeClub,
  awayClub,
  homeScore,
  awayScore,
  meta,
  live,
  statusLabel,
  className,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.2),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative px-5 py-8 text-center sm:px-10 sm:py-12">
        {(live || statusLabel) && (
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
            {live && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white animate-pulse-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Uživo
              </span>
            )}
            {statusLabel && !live && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                {statusLabel}
              </span>
            )}
          </div>
        )}
        {meta && <p className="text-sm text-white/50">{meta}</p>}
        <div className="mt-5 flex flex-col items-center gap-5 sm:mt-6 sm:flex-row sm:justify-center sm:gap-6 lg:gap-10">
          <ClubSide club={homeClub} align="end" />
          <p className="font-display shrink-0 text-5xl font-bold tabular-nums text-white sm:text-6xl md:text-7xl">
            {homeScore ?? 0}
            <span className="mx-1 text-white/35 sm:mx-2">:</span>
            {awayScore ?? 0}
          </p>
          <ClubSide club={awayClub} align="start" />
        </div>
      </div>
    </motion.div>
  );
}
