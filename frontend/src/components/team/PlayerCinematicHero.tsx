import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mediaUrl } from '../../lib/media';
import { clubPath } from '../../lib/public-routes';
import { POSITION_LABELS } from '../../lib/player-utils';
import { ClubCrest } from '../public/clubs/ClubCrest';
import type { Player } from '../../types';

interface Props {
  player: Player & {
    club?: { id: string; name: string; slug?: string; crestPath?: string | null; logoPath?: string | null } | null;
  };
}

export function PlayerCinematicHero({ player }: Props) {
  const pos = player.position
    ? POSITION_LABELS[player.position as keyof typeof POSITION_LABELS] ?? player.position
    : null;

  return (
    <header className="relative min-h-[55vh] overflow-hidden md:min-h-[65vh]">
      {player.photoPath ? (
        <>
          <img
            src={mediaUrl(player.photoPath, 'original')}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[image:var(--gradient-page-hero)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="relative mx-auto flex min-h-[55vh] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 md:min-h-[65vh] md:pb-14">
        <Link
          to="/tim"
          className="glass-premium absolute left-4 top-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:text-white sm:left-6"
        >
          <ArrowLeft size={14} />
          Tim
        </Link>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-10">
          {player.photoPath && (
            <div className="border-gradient-club hidden shrink-0 overflow-hidden rounded-2xl shadow-2xl md:block md:h-52 md:w-40">
              <img
                src={mediaUrl(player.photoPath, 'medium')}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            </div>
          )}
          <div className="space-y-3">
            {player.number != null && (
              <span className="font-display text-6xl font-bold leading-none text-primary-light/30 md:text-8xl">
                {player.number}
              </span>
            )}
            {pos && (
              <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-light">
                {pos}
              </span>
            )}
            <h1 className="font-display text-4xl font-bold uppercase leading-tight text-white sm:text-5xl md:text-6xl">
              {player.firstName}
              <br />
              {player.lastName}
            </h1>
            {player.club && (
              <Link
                to={clubPath(player.club.slug ?? player.club.id)}
                className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-primary-light"
              >
                <ClubCrest club={player.club} size="sm" />
                {player.club.name}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
