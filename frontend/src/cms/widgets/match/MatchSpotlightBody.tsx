import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatDateTime } from '../../../lib/utils';
import { matchRoundLabel } from '../../../lib/round-utils';
import type { Match } from '../../../types';

interface Props {
  next: Match | undefined;
  last: Match | undefined;
  showLast: boolean;
}

export function MatchSpotlightBody({ next, last, showLast }: Props) {
  const reduce = useReducedMotion();

  if (!next && !last) {
    return <p className="text-center text-white/60">Nema zakazanih ili odigranih utakmica.</p>;
  }

  return (
    <div className="relative flex min-h-[min(70dvh,640px)] flex-col justify-center py-10 md:py-14">
      {next && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
              {matchRoundLabel(next) ?? 'Sljedeća utakmica'}
            </span>
          </div>

          <Link to={`/utakmice/${next.id}`} className="group block">
            <p className="font-display text-3xl font-bold uppercase leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {next.homeClub?.name ?? 'Domaćin'}
            </p>
            <p className="my-3 font-display text-2xl font-bold text-primary-light md:text-3xl">VS</p>
            <p className="font-display text-3xl font-bold uppercase leading-tight text-white/80 sm:text-4xl md:text-5xl lg:text-6xl">
              {next.awayClub?.name ?? 'Gost'}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-primary-light" />
                {formatDateTime(next.scheduledAt)}
              </span>
              {next.venue && (
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary-light" />
                  {next.venue}
                </span>
              )}
            </div>

            <span className="btn-hero-outline mx-auto mt-8 inline-flex text-sm">
              Detalji utakmice
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>
      )}

      {showLast && last && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex justify-center md:absolute md:bottom-8 md:right-0 md:mt-0"
        >
          <Link
            to={`/utakmice/${last.id}`}
            className="glass-premium group flex max-w-md items-center gap-4 rounded-2xl border border-white/10 px-5 py-3 transition hover:border-white/25"
          >
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Zadnji rezultat
              </p>
              <p className="text-sm font-medium text-white/70">
                {last.homeClub?.shortName ?? last.homeClub?.name} — {last.awayClub?.shortName ?? last.awayClub?.name}
              </p>
            </div>
            <p className="font-display text-2xl font-bold tabular-nums text-primary-light">
              {last.homeScore}:{last.awayScore}
            </p>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
