import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/media';
import type { ShowcaseClub } from './types';

export function ShowcaseChrome({ club }: { club: ShowcaseClub }) {
  const crest = mediaUrl(club.crestUrl, 'thumb');

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a1628]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {crest ? (
            <img src={crest} alt={club.name} className="h-10 w-10 object-contain" />
          ) : null}
          <div className="min-w-0">
            <p className="font-display truncate text-sm font-bold text-white sm:text-base">{club.name}</p>
            <p className="text-[11px] uppercase tracking-wider text-blue-200/80">U izradi</p>
          </div>
        </div>
        <Link
          to="/prijava"
          className="shrink-0 rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/10"
        >
          Prijava
        </Link>
      </div>
    </header>
  );
}
