import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMatches } from '../../../hooks';
import { formatDateTime } from '../../../lib/utils';
import { matchRoundLabel } from '../../../lib/round-utils';
import { isHeroMatchDockVisible, pickNextAndLast } from './hero-match-utils';

interface Props {
  showLast: boolean;
}

export function HeroMatchDock({ showLast }: Props) {
  const reduce = useReducedMotion();
  const { data } = useMatches();
  const { next, last } = pickNextAndLast(data);

  if (!isHeroMatchDockVisible(data, true, showLast)) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="relative z-10 shrink-0 border-t border-white/10 bg-gradient-to-r from-background/95 via-surface/90 to-background/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          {next && (
            <Link to={`/utakmice/${next.id}`} className="group flex-1">
              <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between md:gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-success" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 sm:text-xs">
                    {matchRoundLabel(next) ?? 'Sljedeća utakmica'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 text-center md:gap-5">
                  <span className="font-display text-base font-bold text-white sm:text-lg md:text-xl">
                    {next.homeClub?.name ?? 'Domaćin'}
                  </span>
                  <span className="font-display text-sm font-bold text-primary-light sm:text-base">VS</span>
                  <span className="font-display text-base font-bold text-white/75 sm:text-lg md:text-xl">
                    {next.awayClub?.name ?? 'Gost'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/50 sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary-light" />
                    {formatDateTime(next.scheduledAt)}
                  </span>
                  {next.venue && (
                    <span className="hidden items-center gap-1.5 sm:flex">
                      <MapPin size={13} className="text-primary-light" />
                      {next.venue}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}

          {showLast && last && (
            <Link
              to={`/utakmice/${last.id}`}
              className="glass-premium flex shrink-0 items-center gap-3 rounded-xl border border-white/10 px-4 py-2.5 transition hover:border-white/20 lg:min-w-[200px]"
            >
              <div className="min-w-0 flex-1 text-left">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-white/35">Zadnji rezultat</p>
                <p className="truncate text-xs text-white/60">
                  {last.homeClub?.shortName ?? last.homeClub?.name} — {last.awayClub?.shortName ?? last.awayClub?.name}
                </p>
              </div>
              <p className="font-display text-xl font-bold tabular-nums text-primary-light">
                {last.homeScore}:{last.awayScore}
              </p>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
