import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Shield, Users } from 'lucide-react';
import { mediaUrl } from '../../lib/media';
import { clubCrestPath } from '../../lib/club-utils';
import type { Club } from '../../types';
import type { ClubSeasonStats, ClubSquadResponse } from '../../types/club-hub';
import { formationLabel, squadCounts } from './team-stats-utils';

interface Props {
  club?: Club | null;
  squad?: ClubSquadResponse | null;
  stats?: ClubSeasonStats | null;
  stadiumName?: string | null;
  city?: string | null;
}

function KpiChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-premium rounded-xl px-4 py-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="font-display mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
    </div>
  );
}

export function TeamCinematicHero({ club, squad, stats, stadiumName, city }: Props) {
  const reduce = useReducedMotion();
  const crest = clubCrestPath(club);
  const formation = formationLabel(squad?.formation);
  const counts = squad ? squadCounts(squad.slots) : null;
  const location = [city, stadiumName].filter(Boolean).join(' · ');
  const standing = stats?.standing;

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,102,255,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          {crest && (
            <div className="relative mb-6">
              <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-2xl" />
              <img
                src={mediaUrl(crest, 'medium')}
                alt=""
                className="relative h-24 w-24 object-contain drop-shadow-[0_0_30px_rgba(96,165,250,0.35)] sm:h-28 sm:w-28 md:h-32 md:w-32"
              />
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-light sm:text-sm">
            Profesionalni kadar
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold uppercase tracking-tight text-gradient-club sm:text-5xl md:text-6xl">
            {club?.name ?? 'Prvi tim'}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
            Formacija, klupa i sezonske statistike — kompletan uvid u ekipu koja predstavlja klub.
          </p>

          {location && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/50">
              <MapPin size={14} />
              {location}
            </p>
          )}

          {club?.slug && (
            <Link
              to={`/klub/${club.slug}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 transition hover:border-primary/30 hover:text-white"
            >
              <Shield size={14} />
              Profil kluba
            </Link>
          )}
        </motion.div>

        {(counts || formation || stats?.season || standing) && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4"
          >
            {counts && <KpiChip label="Igrača" value={counts.total} />}
            {formation && <KpiChip label="Formacija" value={formation} />}
            {stats?.season && <KpiChip label="Sezona" value={stats.season.name} />}
            {standing && <KpiChip label="Bodovi" value={standing.points} />}
          </motion.div>
        )}

        {counts && counts.total > 0 && (
          <p className="mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-white/40">
            <Users size={12} />
            {counts.starters} u startnoj postavi · {counts.bench} na klupi
          </p>
        )}
      </div>
    </header>
  );
}
